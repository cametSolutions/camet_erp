import mongoose from "mongoose";
import SecondaryUser from "../models/secondaryUserModel.js";
import NightAudit from "../models/nightAuditModel.js";

const STRICT_AUDIT_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const isStrictAuditDate = (value = "") =>
  STRICT_AUDIT_DATE_REGEX.test(String(value).trim());

export const normalizeHotelBusinessDate = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (isStrictAuditDate(trimmedValue)) {
      return trimmedValue;
    }

    if (trimmedValue.includes("T")) {
      const [datePart] = trimmedValue.split("T");
      if (isStrictAuditDate(datePart)) {
        return datePart;
      }
    }

    return "";
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return "";
};

export const createNightAuditError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const ensureSecondaryUserCompanyAccess = async ({
  cmp_id,
  secondaryUserId,
}) => {
  if (!secondaryUserId) {
    throw createNightAuditError(401, "Unauthorized");
  }

  if (!cmp_id || !mongoose.Types.ObjectId.isValid(cmp_id)) {
    throw createNightAuditError(400, "Invalid company");
  }

  const secondaryUser = await SecondaryUser.findById(secondaryUserId).select(
    "organization configurations.organization role"
  );

  if (!secondaryUser) {
    throw createNightAuditError(401, "Unauthorized");
  }

  const hasDirectOrganization = Array.isArray(secondaryUser.organization)
    ? secondaryUser.organization.some(
        (organizationId) => String(organizationId) === String(cmp_id)
      )
    : false;

  const hasConfiguredOrganization = Array.isArray(secondaryUser.configurations)
    ? secondaryUser.configurations.some(
        (configuration) =>
          String(configuration?.organization) === String(cmp_id)
      )
    : false;

  if (!hasDirectOrganization && !hasConfiguredOrganization) {
    throw createNightAuditError(
      403,
      "You are not allowed to access this company"
    );
  }

  return secondaryUser;
};

export const ensureNightAuditAdminAccess = (secondaryUser) => {
  if (secondaryUser?.role !== "admin") {
    throw createNightAuditError(
      403,
      "Only admin users can reopen a night audit"
    );
  }
};

export const getNightAuditLockInfo = async ({
  cmp_id,
  auditDate,
  session,
}) => {
  const query = NightAudit.findOne({
    cmp_id,
    status: "completed",
    auditDate: { $gte: auditDate },
  })
    .sort({ auditDate: 1 })
    .lean();

  if (session) {
    query.session(session);
  }

  const lockingAudit = await query;

  return {
    isLocked: Boolean(lockingAudit),
    lockingAudit,
    lockedThroughDate: lockingAudit?.auditDate || null,
  };
};

export const ensureHotelTariffDateIsEditable = async ({
  cmp_id,
  arrivalDate,
  checkOutDate,
  requestedTariffDate,
  session,
}) => {
  const normalizedArrivalDate = normalizeHotelBusinessDate(arrivalDate);
  const normalizedCheckOutDate = normalizeHotelBusinessDate(checkOutDate);
  const normalizedRequestedTariffDate =
    normalizeHotelBusinessDate(requestedTariffDate);

  if (
    !normalizedArrivalDate ||
    !normalizedCheckOutDate ||
    !normalizedRequestedTariffDate
  ) {
    throw createNightAuditError(
      400,
      "Unable to determine the tariff applicable date for this update"
    );
  }

  if (
    normalizedRequestedTariffDate < normalizedArrivalDate ||
    normalizedRequestedTariffDate > normalizedCheckOutDate
  ) {
    throw createNightAuditError(
      403,
      `Tariff applicable date must be between ${normalizedArrivalDate} and ${normalizedCheckOutDate}`
    );
  }

  const { lockedThroughDate } = await getNightAuditLockInfo({
    cmp_id,
    auditDate: normalizedArrivalDate,
    session,
  });

  if (
    lockedThroughDate &&
    normalizedRequestedTariffDate <= lockedThroughDate
  ) {
    throw createNightAuditError(
      403,
      `Tariff applicable date must be after night audited date ${lockedThroughDate}`
    );
  }

  return normalizedRequestedTariffDate;
};

export const ensureHotelDateIsEditable = async ({
  cmp_id,
  recordDate,
  session,
}) => {
  const auditDate = normalizeHotelBusinessDate(recordDate);

  if (!auditDate) {
    throw createNightAuditError(
      400,
      "Unable to determine the check-in business date for this record"
    );
  }

  const { lockingAudit } = await getNightAuditLockInfo({
    cmp_id,
    auditDate,
    session,
  });

  if (lockingAudit) {
    throw createNightAuditError(
      403,
      `Editing is not allowed because ${lockingAudit.auditDate} has been night audited`
    );
  }

  return auditDate;
};
