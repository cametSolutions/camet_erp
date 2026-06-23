import mongoose from "mongoose";
import NightAudit from "../models/nightAuditModel.js";
import {
  createNightAuditError,
  getNightAuditLockInfo,
  ensureNightAuditAdminAccess,
  ensureSecondaryUserCompanyAccess,
  isStrictAuditDate,
} from "../helpers/nightAuditHelper.js";

const buildNightAuditStatusResponse = (
  auditDate,
  audit,
  { isLocked = false, lockedThroughDate = null } = {}
) => {
  if (!audit) {
    return {
      auditDate,
      isAudited: false,
      isLocked,
      lockedThroughDate,
      status: null,
      audit: null,
    };
  }

  return {
    auditDate,
    isAudited: audit.status === "completed",
    isLocked,
    lockedThroughDate,
    status: audit.status,
    audit: {
      auditedBy: audit.auditedBy,
      createdAt: audit.createdAt,
      reopenedBy: audit.reopenedBy,
      reopenedAt: audit.reopenedAt,
      reopenReason: audit.reopenReason,
    },
  };
};

export const getNightAuditStatus = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const auditDate = String(req.query.auditDate || "").trim();

    if (!auditDate) {
      return res.status(400).json({ message: "auditDate is required" });
    }

    if (!isStrictAuditDate(auditDate)) {
      return res
        .status(400)
        .json({ message: "Invalid auditDate format. Expected YYYY-MM-DD" });
    }

    await ensureSecondaryUserCompanyAccess({
      cmp_id,
      secondaryUserId: req.sUserId,
    });

    const audit = await NightAudit.findOne({
      cmp_id,
      auditDate,
    })
      .select("auditDate auditedBy createdAt reopenedBy reopenedAt reopenReason status")
      .lean();

    const lockInfo = await getNightAuditLockInfo({
      cmp_id,
      auditDate,
    });

    return res
      .status(200)
      .json(buildNightAuditStatusResponse(auditDate, audit, lockInfo));
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      message: error.message || "Failed to fetch night audit status",
    });
  }
};

export const completeNightAudit = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const auditDate = String(req.body?.auditDate || "").trim();

    if (!auditDate) {
      return res.status(400).json({ message: "auditDate is required" });
    }

    if (!isStrictAuditDate(auditDate)) {
      return res
        .status(400)
        .json({ message: "Invalid auditDate format. Expected YYYY-MM-DD" });
    }

    await ensureSecondaryUserCompanyAccess({
      cmp_id,
      secondaryUserId: req.sUserId,
    });

    const existingAudit = await NightAudit.findOne({
      cmp_id,
      auditDate,
    });

    if (!existingAudit) {
      try {
        const createdAudit = await NightAudit.create({
          cmp_id,
          auditDate,
          auditedBy: req.sUserId,
          status: "completed",
        });

        return res.status(201).json({
          message: "Night audit completed successfully",
          ...buildNightAuditStatusResponse(auditDate, createdAudit.toObject(), {
            isLocked: true,
            lockedThroughDate: auditDate,
          }),
        });
      } catch (error) {
        if (error?.code === 11000) {
          return res.status(409).json({
            message: "This date has already been night audited",
          });
        }

        throw error;
      }
    }

    if (existingAudit.status === "completed") {
      return res.status(409).json({
        message: "This date has already been night audited",
      });
    }

    existingAudit.status = "completed";
    existingAudit.auditedBy = req.sUserId;
    existingAudit.reopenedBy = null;
    existingAudit.reopenedAt = null;
    existingAudit.reopenReason = null;

    await existingAudit.save();

    return res.status(200).json({
      message: "Night audit completed successfully",
      ...buildNightAuditStatusResponse(auditDate, existingAudit.toObject(), {
        isLocked: true,
        lockedThroughDate: auditDate,
      }),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: "This date has already been night audited",
      });
    }

    const status = error.status || 500;
    return res.status(status).json({
      message: error.message || "Failed to complete night audit",
    });
  }
};

export const reopenNightAudit = async (req, res) => {
  try {
    const { cmp_id } = req.params;
    const auditDate = String(req.body?.auditDate || "").trim();
    const reopenReason = String(req.body?.reopenReason || "").trim();

    if (!auditDate) {
      return res.status(400).json({ message: "auditDate is required" });
    }

    if (!reopenReason) {
      return res.status(400).json({ message: "reopenReason is required" });
    }

    if (!isStrictAuditDate(auditDate)) {
      return res
        .status(400)
        .json({ message: "Invalid auditDate format. Expected YYYY-MM-DD" });
    }

    const secondaryUser = await ensureSecondaryUserCompanyAccess({
      cmp_id,
      secondaryUserId: req.sUserId,
    });

    ensureNightAuditAdminAccess(secondaryUser);

    const existingAudit = await NightAudit.findOne({
      cmp_id,
      auditDate,
    });

    if (!existingAudit) {
      throw createNightAuditError(404, "Night audit not found for this date");
    }

    existingAudit.status = "reopened";
    existingAudit.reopenedBy = req.sUserId;
    existingAudit.reopenedAt = new Date();
    existingAudit.reopenReason = reopenReason;

    await existingAudit.save();

    return res.status(200).json({
      message: "Night audit reopened successfully",
      ...buildNightAuditStatusResponse(auditDate, existingAudit.toObject(), {
        isLocked: false,
        lockedThroughDate: null,
      }),
    });
  } catch (error) {
    const status = error.status || 500;
    return res.status(status).json({
      message: error.message || "Failed to reopen night audit",
    });
  }
};
