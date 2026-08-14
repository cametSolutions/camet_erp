from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT = "output/pdf/camet_hotel_restaurant_workflow_report.pdf"


class NumberedCanvas:
    pass


def make_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#153243"),
            spaceAfter=18,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["Normal"],
            fontSize=10,
            leading=14,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#4F5D63"),
            spaceAfter=22,
        ),
        "h1": ParagraphStyle(
            "Heading1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=colors.HexColor("#153243"),
            spaceBefore=10,
            spaceAfter=8,
        ),
        "h2": ParagraphStyle(
            "Heading2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16,
            textColor=colors.HexColor("#284B63"),
            spaceBefore=8,
            spaceAfter=5,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontSize=9.4,
            leading=13.2,
            textColor=colors.HexColor("#1F2933"),
            spaceAfter=6,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#4F5D63"),
        ),
        "table_header": ParagraphStyle(
            "TableHeader",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=colors.white,
            alignment=TA_LEFT,
        ),
        "table": ParagraphStyle(
            "Table",
            parent=base["BodyText"],
            fontSize=7.8,
            leading=10,
            textColor=colors.HexColor("#1F2933"),
        ),
        "callout": ParagraphStyle(
            "Callout",
            parent=base["BodyText"],
            fontSize=9,
            leading=12.5,
            textColor=colors.HexColor("#153243"),
            backColor=colors.HexColor("#EEF7F2"),
            borderColor=colors.HexColor("#A7D8C9"),
            borderWidth=0.75,
            borderPadding=8,
            spaceAfter=8,
        ),
    }


def P(text, style):
    return Paragraph(text, style)


def page_header_footer(canvas, doc):
    canvas.saveState()
    width, height = doc.pagesize
    canvas.setFillColor(colors.HexColor("#153243"))
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(doc.leftMargin, height - 0.38 * inch, "Camet ERP - Hotel and Restaurant Workflow Analysis")
    canvas.setStrokeColor(colors.HexColor("#D7DEE2"))
    canvas.line(doc.leftMargin, height - 0.48 * inch, width - doc.rightMargin, height - 0.48 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#61727A"))
    canvas.drawString(doc.leftMargin, 0.35 * inch, "Generated from local source inspection")
    canvas.drawRightString(width - doc.rightMargin, 0.35 * inch, f"Page {doc.page}")
    canvas.restoreState()


def styled_table(data, widths=None, repeat=1, font_size=7.8):
    table_data = []
    styles = make_styles()
    for r, row in enumerate(data):
        row_style = styles["table_header"] if r < repeat else styles["table"]
        table_data.append([P(str(cell), row_style) for cell in row])
    t = Table(table_data, colWidths=widths, repeatRows=repeat, hAlign="LEFT")
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, repeat - 1), colors.HexColor("#284B63")),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#CAD4D8")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("ROWBACKGROUNDS", (0, repeat), (-1, -1), [colors.white, colors.HexColor("#F7FAFB")]),
            ]
        )
    )
    return t


def flow_table(title, rows, styles):
    story = [P(title, styles["h2"])]
    story.append(styled_table([["Step", "User / Screen", "Backend Action", "Data Impact"]] + rows, [0.55*inch, 1.25*inch, 2.65*inch, 2.55*inch]))
    story.append(Spacer(1, 8))
    return story


def build():
    styles = make_styles()
    doc = BaseDocTemplate(
        OUTPUT,
        pagesize=A4,
        rightMargin=0.55 * inch,
        leftMargin=0.55 * inch,
        topMargin=0.68 * inch,
        bottomMargin=0.58 * inch,
        title="Camet ERP Hotel and Restaurant Workflow Report",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=page_header_footer)])

    story = []
    story.append(Spacer(1, 1.2 * inch))
    story.append(P("Camet ERP", styles["title"]))
    story.append(P("Hotel and Restaurant Working Flow Analysis", styles["title"]))
    story.append(P("Prepared from the local codebase on 14 August 2026. Scope: React frontend routes and screens, Express routes, Mongoose models, hotel/restaurant controllers, helper services, reports, and accounting integration.", styles["subtitle"]))
    story.append(P("Executive View", styles["h1"]))
    story.append(P("The application runs hotel front-office, restaurant/KOT, and accounting flows as one integrated ERP module. Hotel operations manage room masters, booking, check-in, check-out, room status, advances, guest identity, tariff/tax calculation, receipts, checkout sales, reports, and night-audit locking. Restaurant operations manage item masters, tables, KOT creation, kitchen batches, dine-in/takeaway/room-service sales, split payment, complimentary handling, direct sales, and transfer of food bills to checked-in rooms.", styles["body"]))
    story.append(P("Important architecture note: most hotel and restaurant APIs are mounted from the secondary-user router and protected with authentication. The implementation is transactional in the critical write flows, using Mongoose sessions around room creation, KOT generation, checkout conversion, receipt creation, and settlement updates.", styles["callout"]))
    story.append(styled_table([
        ["Layer", "Main Files", "Purpose"],
        ["Frontend routing", "frontend/src/routes/Routers.jsx", "Maps protected secondary-user screens for hotel dashboard, booking, check-in/out, KOT, tables, reports, and settings."],
        ["Hotel UI", "frontend/src/pages/Hotel", "Operational screens for room setup, bookings, check-in/out, bill summary, print pages, dashboard, and reports."],
        ["Restaurant UI", "frontend/src/pages/Restuarant", "KOT page, dashboard, item registration/list, table selection/master, print helpers, order cards, reports."],
        ["Backend routes", "backend/routes/secondaryUserRouters.js", "Authenticated API surface for hotel, restaurant, accounting, masters, reports, and settings."],
        ["Hotel backend", "backend/controllers/hotelController.js, backend/controllers/hotelController2CheckOut.js", "Hotel masters, booking lifecycle, checkout, sales conversion, reports, room state, email, cancellation, and cross-module food posting."],
        ["Restaurant backend", "backend/controllers/restaurantController.js", "Item master, tables, KOT, direct sale, KOT payment conversion, print data, restaurant reports, and bill transfer."],
        ["Models", "bookingModal.js, roomModal.js, kotModal.js, TableModel.js", "Persistent records for bookings/check-ins/check-outs, rooms, KOTs, and tables."],
        ["Helpers", "hotelHelper.js, restaurantHelper.js, checkoutHelper.js, saleCalculationHelper.js, nightAuditHelper.js", "Filtering, room status, tax recalculation, payment receipts, settlements, mail, exports, and audit date validation."],
    ], [1.0*inch, 2.25*inch, 3.75*inch]))

    story.append(PageBreak())
    story.append(P("Hotel Module", styles["h1"]))
    story.append(P("The hotel module starts with masters and configuration, then moves through booking, check-in, in-stay changes, checkout calculation, sale conversion, receipt/settlement posting, and reporting. The central records are Booking, CheckIn, and CheckOut, all backed by one extended schema. Rooms are held separately and status changes are synchronized through helper logic.", styles["body"]))
    story += flow_table("Hotel Operating Flow", [
        ["1", "Masters and setup", "Save additional pax, visit purpose, ID proof, food plan, rooms, room price levels, room type, floor, HSN, and hotel/restaurant config.", "Creates master data used by booking and checkout calculations."],
        ["2", "Room registration/list", "addRoom, getRooms, getAllRooms, editRoom, deleteRoom.", "Room records include type, bed, floor, HSN, unit, price levels, and status values: vacant, occupied, booked, dirty, blocked, household."],
        ["3", "Booking", "roomBooking generates hotel voucher numbers, validates availability, stores customer/guest, dates, rooms, food plan, additional pax, advances, and totals.", "Booking document created; selected rooms and advance tracking establish the future stay."],
        ["4", "Check-in", "Check-in is handled by posting selected booking/check-in data into the shared booking schema with status changes and room occupancy.", "Room becomes occupied/booked as applicable; guest identity and room details are retained."],
        ["5", "During stay", "swapRoom, updateBooking, updateCheckout, controlTaggedCheckIn, hold/release checkout, fetch current room status.", "Room swap history, partial checkout history, hold arrays, and room status are updated."],
        ["6", "Checkout preparation", "checkoutWithArrayOfData and fetchOutStandingAndFoodData gather selected stays, advances, food bills, outstanding data, other charges, and payment allocations.", "Checkout preview combines room, food plan, extra pax, restaurant, advance, discount, and payment data."],
        ["7", "Checkout conversion", "convertCheckOutToSale recalculates room tax, creates CheckOut, hotel sales voucher, TallyData, receipts, settlements, and updates rooms.", "Rooms move toward dirty/available, sales and outstanding ledgers are posted, receipts settle paid amounts."],
        ["8", "Post-checkout", "Print/email APIs fetch specific data for checkout, sale, KOT, booking, or check-in; reports summarize sales, occupancy, cancellations, and login data.", "Operational and accounting output becomes available for front office and management."],
    ], styles)
    story.append(P("Key hotel calculation behavior", styles["h2"]))
    story.append(P("Checkout recalculation uses stay days per room, including room swap dates, then calculates taxable room amount, food plan totals, food plan tax, additional pax amount/tax, room total, grand total, and balance after advance. This matters because checkout does not simply reuse the original booking total; it recalculates the stay from selected room data before creating sales and tally entries.", styles["body"]))
    story.append(P("Night-audit protection", styles["h2"]))
    story.append(P("The night-audit helpers normalize business dates, check whether an audited date locks a record, prevent tariff updates on locked dates, and restrict audit reopening to admin secondary users. This is an important control for preventing back-dated changes after daily closure.", styles["body"]))

    story.append(PageBreak())
    story.append(P("Restaurant Module", styles["h1"]))
    story.append(P("The restaurant module is connected to both independent restaurant billing and hotel room-service billing. It uses product items as restaurant items, price levels to distinguish dine-in, takeaway, room service, and delivery pricing, KOT records for kitchen workflow, and sales/receipt/tally records for accounting output.", styles["body"]))
    story += flow_table("Restaurant Operating Flow", [
        ["1", "Item master", "addItem, updateItem, getItems, getAllItems, searchItems, exportItemsToExcel.", "Creates product records with item code, image, category/subcategory, HSN/tax, unit, price levels, and default godown."],
        ["2", "Table master", "saveTableNumber, getTables, updateTable, deleteTable, updateTableStatus.", "Tracks table number, description, and status. Occupied tables become effectively available after 24 hours through a model virtual."],
        ["3", "KOT creation", "generateKot creates a memoRandom voucher number, stores items/type/customer/food plan/kitchen batches, and occupies dine-in table.", "KOT document is created as pending or completed depending on kotAutoApproval config."],
        ["4", "KOT edit/print", "editKot updates items, table, status, kitchen batches; frontend helpers generate kitchen tickets and customer bills.", "Kitchen batches preserve printed item groups; table status follows dine-in movement."],
        ["5", "Payment/direct sale", "directSale and updateKotPayment convert KOTs or direct restaurant orders into sales, receipt/tally/settlement records, or room-posted credit.", "Food sales are posted under restaurant voucher series and payment splits are retained."],
        ["6", "Room service", "KOT can store roomId and checkInNumber; getRestaurantBillsDetails maps KOTs to sale numbers for a checked-in guest.", "Food bills can follow the guest to checkout and be included or settled there."],
        ["7", "Transfer bills", "transferKotBills moves selected KOT/sales records to another target room/check-in and updates party information.", "Misposted restaurant bills can be reassigned before final hotel settlement."],
        ["8", "Reports", "getKotRegister, getSalesRegister, category-wise sales, date-wise item report.", "Management can review KOTs, restaurant bill type, room number, food plan, payment type, customer, tax, discount, and cancellation state."],
    ], styles)
    story.append(P("Restaurant payment behavior", styles["h2"]))
    story.append(P("The restaurant helper normalizes source types such as cash, bank, UPI, card, cheque, and credit. It recalculates KOT item tax/discount details and builds receipts for non-credit food split rows. When restaurant bills are part of a hotel checkout, the checkout helper can distribute food payments across restaurant sales and update their TallyData pending amount.", styles["body"]))

    story.append(PageBreak())
    story.append(P("Shared Hotel and Restaurant Accounting Flow", styles["h1"]))
    story.append(P("The strongest integration point is checkout. Hotel checkout can include room charges, food plans, additional pax, other charges, discounts, restaurant bills, advances, and split payments. The newer checkout controller recalculates checkout data, separates room and food payment splits, creates sales vouchers, creates TallyData rows, creates receipts for non-credit payments, and creates Settlement records.", styles["body"]))
    story.append(styled_table([
        ["Flow Area", "What Happens", "System Impact"],
        ["Voucher series", "Hotel and restaurant use voucher series with `under` values such as hotel and restaurant for sales and receipts.", "Numbers remain separated by operational area while sharing the accounting model."],
        ["Sales conversion", "Hotel checkout creates salesModel rows from room data; restaurant direct/KOT payment creates restaurant sales rows from KOT items.", "Both modules become standard sales vouchers for reports and accounting."],
        ["TallyData", "Checkout and restaurant sales create bill rows with bill amount and pending amount.", "Outstanding and receipt allocation logic can work consistently."],
        ["Receipts", "Non-credit cash/bank/UPI/card/cheque splits create receiptModel records against billData.", "Payments reduce pending amounts and provide print/report records."],
        ["Settlements", "Receipt creation is accompanied by settlementModel rows pointing to cash/bank source parties.", "Collection breakdown dashboards and source balances can be derived."],
        ["Credit / post-to-room", "Credit splits do not create receipts immediately; restaurant food can be posted to room and settled at hotel checkout.", "Outstanding remains visible until checkout or later receipt."],
    ], [1.35*inch, 2.9*inch, 2.75*inch]))
    story.append(P("End-to-end checkout sequence", styles["h2"]))
    story.append(styled_table([
        ["No.", "Processing Step"],
        ["1", "Receive selected checkout rows, payment details, checkout mode, room assignments, restaurant base sale data, and discount/advance adjustments."],
        ["2", "Recalculate each checkout row with stay days, room tax, food plan, additional pax, room total, grand total, and balance."],
        ["3", "Fetch hotel sales voucher series and pre-fetch matching booking/check-in documents."],
        ["4", "For each checkout item, determine customer party, payment mode, paid amount, pending amount, and room/food split arrays."],
        ["5", "Create a CheckOut document and hotel Sales voucher with selected rooms as sales items."],
        ["6", "Create TallyData rows; for split mode, non-credit room payments can become zero-pending rows while credit remains pending."],
        ["7", "Update booking/check-in receipt references from booking/check-in numbers to sale numbers."],
        ["8", "Create hotel and restaurant receipts/settlements for non-credit payments and update TallyData pending balances."],
        ["9", "Mark full or partial checkout history, update remaining rooms, and sync room status through hotel helper logic."],
    ], [0.45*inch, 6.5*inch]))

    story.append(PageBreak())
    story.append(P("Reports and Dashboards", styles["h1"]))
    story.append(P("The codebase includes operational dashboards and export/report APIs for daily management, finance, occupancy, and audit needs. Several frontend routes expose these as protected secondary-user screens.", styles["body"]))
    story.append(styled_table([
        ["Report / View", "Data Covered"],
        ["Hotel Dashboard and Summary Dashboard", "Consolidated totals, revenue breakdown, daily/monthly collection, property sales, room count summary."],
        ["Hotel Flash Report", "Date-based room and revenue snapshot with room metrics and restaurant details."],
        ["Bill Summary / View Report", "Checkout or bill-level view by selected period and criteria."],
        ["Receipt Report", "Receipt records by voucher series."],
        ["Login Report", "Check-in records, status summary, created-by user, room swap and partial checkout history; exportable as PDF or Excel."],
        ["Tourist Report", "Guest stay data including identity and travel/foreign-national fields."],
        ["Food Plan Report", "Food plan usage and related totals."],
        ["Occupancy Checkout Report", "Checked-out occupancy and revenue data."],
        ["Travel Agent / FO Sales Summary", "Agent-related and front-office sales reporting."],
        ["Cancellation Report", "Cancelled booking, check-in, checkout, KOT, receipt, and sale records in one report."],
        ["Restaurant KOT Register", "KOT-level operational history and cancellation/payment state."],
        ["Restaurant Sales Register", "Restaurant sales by bill type, room, food plan, payment type, item, tax, discount, customer, sponsor, and cancellation."],
    ], [2.0*inch, 5.0*inch]))

    story.append(P("Controls and Strengths", styles["h1"]))
    story.append(styled_table([
        ["Control", "Observed Implementation"],
        ["Authentication and company scope", "Most APIs are protected by authSecondary and companyAuthentication checks, with secondary-user company access validation in night audit helpers."],
        ["Transactions", "Critical writes use Mongoose sessions and transactions, especially room creation, KOT creation, KOT edit, and checkout conversion."],
        ["Night audit", "Completed audit dates lock edits for hotel records/tariffs; reopening requires admin access and reason capture."],
        ["Voucher separation", "Sales and receipts use voucher series, with hotel and restaurant series distinguished by `under` value."],
        ["Room/table status", "Rooms track hotel lifecycle statuses; tables track restaurant availability and occupancy."],
        ["Cross-module correction", "Room swap, partial checkout, bill transfer, hold/release, cancellation, and checkout edit APIs exist for real operational exceptions."],
    ], [1.7*inch, 5.3*inch]))

    story.append(PageBreak())
    story.append(P("Recommended Improvements", styles["h1"]))
    story.append(P("The following recommendations are based on code structure and flow complexity, not on runtime testing against production data.", styles["body"]))
    story.append(styled_table([
        ["Priority", "Recommendation", "Reason"],
        ["High", "Split the very large hotel and restaurant controllers into service files by lifecycle: masters, booking, check-in, checkout, reports, restaurant billing, KOT/table.", "The current controllers carry many responsibilities, which makes regression risk higher and slows review."],
        ["High", "Standardize naming and folder spelling: `Restuarant` appears throughout frontend paths.", "Consistent spelling lowers route/import mistakes and helps onboarding."],
        ["High", "Add integration tests for checkout conversion with single, split, credit, room-service, partial checkout, and restaurant-posted bills.", "Checkout is the highest-risk flow because it touches CheckOut, Sales, TallyData, Receipts, Settlements, rooms, bookings, and restaurant sales."],
        ["Medium", "Centralize payment split normalization across hotel and restaurant.", "Several functions normalize cash/bank/UPI/card/credit differently; a shared helper would reduce accounting edge cases."],
        ["Medium", "Add explicit status enums for KOT and table status similar to ROOM_STATUS_VALUES.", "This would prevent silent drift from typos or inconsistent casing."],
        ["Medium", "Document voucher series requirements for hotel and restaurant setup.", "Missing series causes hard failures at operational moments such as KOT, checkout, or receipt creation."],
        ["Low", "Replace noisy console logging in controllers with structured logging guarded by environment.", "Current logs may expose customer/payment data and make production debugging noisy."],
    ], [0.75*inch, 3.0*inch, 3.25*inch]))
    story.append(P("Source Files Reviewed", styles["h1"]))
    story.append(P("backend/routes/secondaryUserRouters.js; backend/routes/kotRoutes.js; backend/controllers/hotelController.js; backend/controllers/hotelController2CheckOut.js; backend/controllers/restaurantController.js; backend/controllers/nightAuditController.js; backend/helpers/hotelHelper.js; backend/helpers/restaurantHelper.js; backend/helpers/checkoutHelper.js; backend/helpers/saleCalculationHelper.js; backend/helpers/nightAuditHelper.js; backend/models/bookingModal.js; backend/models/roomModal.js; backend/models/kotModal.js; backend/models/TableModel.js; frontend/src/routes/Routers.jsx; frontend/src/pages/Hotel; frontend/src/pages/Restuarant.", styles["small"]))
    story.append(P("Conclusion", styles["h1"]))
    story.append(P("Camet ERP's hotel and restaurant modules are designed as an integrated hospitality workflow rather than two isolated modules. The hotel side manages the guest stay lifecycle and final accounting. The restaurant side manages food ordering, kitchen operations, table/room-service context, and food billing. The checkout layer joins them into one financial settlement process, using sales, TallyData, receipts, and settlements to make room, food, advance, discount, and split-payment activity reportable.", styles["body"]))

    doc.build(story)


if __name__ == "__main__":
    build()
