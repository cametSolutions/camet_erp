import { forwardRef } from "react"
import { useSelector } from "react-redux"

const ReceiptInvoice = forwardRef(({ data }, ref) => {
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  )
console.log(data)
  const isCancelled =
    data?.isCancelled === true || data?.status?.toLowerCase() === "cancelled"

  const buildAddress = (org) => {
    if (!org) return ""
    return [
      org.flat,
      org.road,
      org.landmark,
      org.state,
      org.pin ? `- ${org.pin}` : ""
    ]
      .filter(Boolean)
      .join(", ")
  }

  const numberToWords = (num) => {
    if (!num || num === 0) return "Zero"

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen"
    ]

    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety"
    ]

    const convert = (n) => {
      if (n < 20) return ones[n]
      if (n < 100) return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim()
      if (n < 1000)
        return `${ones[Math.floor(n / 100)]} Hundred ${convert(n % 100)}`.trim()
      if (n < 100000)
        return `${convert(Math.floor(n / 1000))} Thousand ${convert(n % 1000)}`.trim()
      if (n < 10000000)
        return `${convert(Math.floor(n / 100000))} Lakh ${convert(n % 100000)}`.trim()
      return `${convert(Math.floor(n / 10000000))} Crore ${convert(n % 10000000)}`.trim()
    }

    return convert(Math.floor(num))
  }

  const amountInWords = `${numberToWords(Number(data?.enteredAmount || 0))} Only`

  const roomOrProduct =
    data?.billData
      ?.flatMap((bill) => [
        ...(bill?.roomNames || []),
        ...(bill?.productNames || [])
      ])
      ?.filter(Boolean)
      ?.join(", ") || ""

  const formattedDate = data?.date
    ? new Date(data.date).toLocaleDateString("en-GB")
    : ""

  return (
    <div ref={ref} className="receipt">
      <style>{`
        .receipt {
          width: 800px;
          padding: 30px 35px;
          border: 2px solid #000;
          font-family: "Times New Roman", serif;
          font-size: 15px;
          line-height: 1.7;
          box-sizing: border-box;
          background: #fff;
          position: relative;
          margin: 0 auto;
        }

        .cancelled-stamp {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-25deg);
          border: 4px solid #b91c1c;
          color: #b91c1c;
          padding: 8px 24px;
          font-size: 42px;
          font-weight: bold;
          letter-spacing: 3px;
          opacity: 0.14;
          pointer-events: none;
          z-index: 10;
          text-transform: uppercase;
          background: transparent;
        }

        /* HEADER */
        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .top-left img {
          width: 120px;
          max-height: 110px;
          object-fit: contain;
        }

        .top-right {
          text-align: right;
          max-width: 65%;
        }

        .org-name {
          font-size: 20px;
          font-weight: bold;
        }

        .advance {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          margin: 18px 0 25px;
          letter-spacing: 1px;
        }

        /* ROWS */
        .row {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          margin: 12px 0;
        }

        .label {
          white-space: nowrap;
        }

        .line {
          flex: 1;
          border-bottom: 1px solid #000;
          padding-left: 6px;
          font-weight: bold;
          min-height: 22px;
          box-sizing: border-box;
          word-break: break-word;
        }

        .line.wide {
          flex: 2;
        }

        /* FOOTER */
        .bottom {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .amount {
          font-size: 18px;
          font-weight: bold;
        }

        .sign {
          margin-top: 30px;
        }

        @page {
          size: auto;
          margin: 14mm 12mm;
        }

        @media print {
          html, body {
            margin: 0;
            padding: 0;
            background: #fff;
          }

          .receipt {
            width: 100%;
            border: 2px solid #000;
            margin: 0 auto;
            box-shadow: none;
            page-break-inside: avoid;
          }

          .cancelled-stamp {
            opacity: 0.16;
          }
        }
      `}</style>

      {isCancelled && <div className="cancelled-stamp">CANCELLED</div>}

      <div className="top">
        <div className="top-left">
          {organization?.logo && <img src={organization.logo} alt="Logo" />}
        </div>

        <div className="top-right">
          <div className="org-name">{organization?.name}</div>
          <div>{buildAddress(organization)}</div>
          <div>PH: {organization?.mobile}</div>
        </div>
      </div>

      <div className="advance">RECEIPT</div>

      <div className="row">
        <span className="label">Receipt Number :-</span>
        <span className="line">{data?.receiptNumber || ""}</span>

        <span className="label">Date :-</span>
        <span className="line">{formattedDate}</span>
      </div>

      <div className="row">
        <span className="label">Received with thanks from Mr./Mrs./M/s.</span>
        <span className="line wide">{data?.party?.partyName || ""}</span>
      </div>

      <div className="row">
        <span className="label">Room / Product :-</span>
        <span className="line">{roomOrProduct}</span>
      </div>

      <div className="row">
        <span className="label">a Sum of Rupees</span>
        <span className="line wide">{amountInWords}</span>
      </div>

      <div className="row">
        <span className="label">Remarks</span>
        <span className="line wide">{data?.note || ""}</span>
      </div>

      <div className="row">
        <span className="label">by</span>
        <span className="line">{data?.paymentMethod || ""}</span>
        <span>as Front Office Advance.</span>
      </div>

      <div className="bottom">
        <div className="amount">
          Rs. {Number(data?.enteredAmount || 0).toFixed(2)}
        </div>

        <div style={{ textAlign: "right" }}>
          <div>For, {organization?.name}</div>
          <div className="sign">Authorised Signatory</div>
        </div>
      </div>
    </div>
  )
})

export default ReceiptInvoice