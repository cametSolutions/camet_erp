// import { forwardRef } from "react"
// import { useSelector } from "react-redux"

// const ReceiptInvoice = forwardRef(({ data }, ref) => {
//   const organization = useSelector(
//     (state) => state?.secSelectedOrganization?.secSelectedOrg
//   )
//   console.log(organization)
//   const buildAddress = (org) => {
//     if (!org) return []

//     return [
//       [
//         org.flat,
//         org.road,
//         org.landmark,
//         org.state,
//         org.pin ? `- ${org.pin}` : ""
//       ]
//         .filter(Boolean)
//         .join(", ")
//     ]
//   }

//   console.log(organization)
//   console.log(organization.logo)
//   console.log(ref)
//   console.log(data)
//   console.log(data.enteredAmount)
//   const numberToWords = (num) => {
//     if (!num || num === 0) return "Zero"

//     const ones = [
//       "",
//       "One",
//       "Two",
//       "Three",
//       "Four",
//       "Five",
//       "Six",
//       "Seven",
//       "Eight",
//       "Nine",
//       "Ten",
//       "Eleven",
//       "Twelve",
//       "Thirteen",
//       "Fourteen",
//       "Fifteen",
//       "Sixteen",
//       "Seventeen",
//       "Eighteen",
//       "Nineteen"
//     ]

//     const tens = [
//       "",
//       "",
//       "Twenty",
//       "Thirty",
//       "Forty",
//       "Fifty",
//       "Sixty",
//       "Seventy",
//       "Eighty",
//       "Ninety"
//     ]

//     const convert = (n) => {
//       if (n < 20) return ones[n]
//       if (n < 100) return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim()
//       if (n < 1000)
//         return `${ones[Math.floor(n / 100)]} Hundred ${convert(n % 100)}`.trim()
//       if (n < 100000)
//         return `${convert(Math.floor(n / 1000))} Thousand ${convert(n % 1000)}`.trim()
//       if (n < 10000000)
//         return `${convert(Math.floor(n / 100000))} Lakh ${convert(n % 100000)}`.trim()

//       return `${convert(Math.floor(n / 10000000))} Crore ${convert(n % 10000000)}`.trim()
//     }

//     return convert(num)
//   }
//   const amountInWords = `${numberToWords(Number(data.enteredAmount))} Only`
//   console.log(amountInWords)

//   return (
//     <div ref={ref} className="receipt">
//       <style>{`
//         .receipt {
//           width: 800px;
//           padding: 25px 35px;
//           border: 2px solid #000;
//           font-family: "Times New Roman", serif;
//           font-size: 15px;
//           line-height: 1.7;
//         }

//         /* TOP HEADER */
//         .top {
//           display: flex;
//         }

//         .top-left {
//           width: 40%;
//         }

//         .top-right {
//           width: 60%;
//           text-align: right;
//         }

//         .hotel-big {
//           font-size: 20px;
//           font-weight: bold;
//         }

//         .advance {
//           text-align: center;
//           font-size: 22px;
//           font-weight: bold;
//           margin: 15px 0 20px;
//           letter-spacing: 1px;
//         }

//         /* FORM ROWS */
//         .row {
//           margin: 10px 0;
//         }

//         .inline {
//           display: inline-block;
//           vertical-align: bottom;
//         }

//         .line {
//           border-bottom: 1px solid #000;
//           display: inline-block;
//           min-width: 220px;
//           padding-left: 5px;
//           font-weight: bold;
//         }

//         .wide {
//           min-width: 420px;
//         }

//         /* AMOUNT + SIGN */
//         .bottom {
//           margin-top: 40px;
//           display: flex;
//         }

//         .bottom-left {
//           width: 50%;
//           font-size: 18px;
//           font-weight: bold;
//         }

//         .bottom-right {
//           width: 50%;
//           text-align: right;
//         }

//         .sign {
//           margin-top: 20px;
//         }
//       `}</style>

//       {/* TOP HEADER */}
//       <div className="top">
//         <div className="top-left">
//           {organization.logo && (
//             <img
//               src={organization?.logo}
//               alt="Logo"
//               style={{ width: "120px", height: "auto" }}
//             />
//           )}
//         </div>

//         <div className="top-right">
//           <div className="hotel-big">{organization.name}</div>
//           <div>
//             {buildAddress(organization).map((line, index) => (
//               <div key={index}>{line}</div>
//             ))}
//           </div>
//           <div>PH: 04868 272777, 91 8593928999</div>
//         </div>
//       </div>

//       {/* TITLE */}
//       <div className="advance">ADVANCE RECEIPT</div>

//       {/* RECEIPT + DATE */}
//       <div className="row">
//         <span className="inline">Receipt Number :-</span>
//         <span className="line">{data.receiptNumber}</span>

//         <span style={{ marginLeft: 40 }} className="inline">
//           Date :-
//         </span>
//         <span className="line">
//           {" "}
//           {new Date(data.date).toLocaleDateString("en-GB")}
//         </span>
//       </div>

//       {/* RECEIVED FROM */}
//       <div className="row">
//         <span className="inline">Received with thanks from Mr./Mrs./M/s.</span>
//         <span className="line wide">{data?.party?.partyName}</span>
//       </div>

//       {/* ROOM + DATE */}
//       <div className="row">
//         <span className="inline">Room No :-</span>
//         <span className="line">
//           {" "}
//           {/* {data?.billData?.flatMap((bill) => bill.roomNames || bill.productNames).join(", ")} */}
//           {data?.billData
//             ?.flatMap((bill) => [
//               ...(bill.roomNames || []),
//               ...(bill.productNames || [])
//             ])
//             .join(", ")}
//         </span>

//         {/* <span style={{ marginLeft: 60 }} className="line">
//           {data.stayDate}
//         </span> */}
//       </div>

//       {/* AMOUNT IN WORDS */}
//       <div className="row">
//         <span className="inline">a Sum of Rupees</span>
//         <span className="line wide">{amountInWords}</span>
//       </div>

//       {/* REMARKS */}
//       <div className="row">
//         <span className="inline">Remarks</span>
//         <span className="line wide">{data.remarks}</span>
//       </div>

//       {/* PAYMENT */}
//       <div className="row">
//         <span className="inline">by</span>
//         <span className="line">{data.paymentMethod}</span>
//         <span style={{ marginLeft: 10 }}>as Front Office Advance.</span>
//       </div>

//       {/* BOTTOM */}
//       <div className="bottom">
//         <div className="bottom-left">Rs. {data.enteredAmount}.00</div>

//         <div className="bottom-right">
//           <div>For, {organization.name}</div>
//           <div className="sign">Authorised Signatory</div>
//         </div>
//       </div>
//     </div>
//   )
// })

// export default ReceiptInvoice
import { forwardRef } from "react"
import { useSelector } from "react-redux"

const ReceiptInvoice = forwardRef(({ data }, ref) => {
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  )
console.log(organization)

  /* BUILD ADDRESS */
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

  /* NUMBER TO WORDS (INDIAN FORMAT) */
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

    return convert(num)
  }

  const amountInWords = `${numberToWords(Number(data?.enteredAmount))} Only`

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
        }

        /* HEADER */
        .top {
          display: flex;
          justify-content: space-between;
        }

        .top-left img {
          width: 120px;
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
      `}</style>

      {/* HEADER */}
      <div className="top">
        <div className="top-left">
          {organization?.logo && <img src={organization.logo} alt="Logo" />}
        </div>

        <div className="top-right">
          <div className="org-name">{organization?.name}</div>
          <div>{buildAddress(organization)}</div>
          <div>PH:{organization.mobile}</div>
        </div>
      </div>

      {/* TITLE */}
      <div className="advance">RECEIPT</div>

      {/* RECEIPT DETAILS */}
      <div className="row">
        <span className="label">Receipt Number :-</span>
        <span className="line">{data?.receiptNumber}</span>

        <span className="label">Date :-</span>
        <span className="line">
          {new Date(data?.date).toLocaleDateString("en-GB")}
        </span>
      </div>

      <div className="row">
        <span className="label">Received with thanks from Mr./Mrs./M/s.</span>
        <span className="line wide">{data?.party?.partyName}</span>
      </div>

      <div className="row">
        <span className="label">Room / Product :-</span>
        <span className="line">
          {data?.billData
            ?.flatMap((bill) => [
              ...(bill.roomNames || []),
              ...(bill.productNames || [])
            ])
            .join(", ")}
        </span>
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
        <span className="line">{data?.paymentMethod}</span>
        <span>as Front Office Advance.</span>
      </div>

      {/* FOOTER */}
      <div className="bottom">
        <div className="amount">Rs. {data?.enteredAmount}.00</div>

        <div style={{ textAlign: "right" }}>
          <div>For, {organization?.name}</div>
          <div className="sign">Authorised Signatory</div>
        </div>
      </div>
    </div>
  )
})

export default ReceiptInvoice
