import TitleDiv from "@/components/common/TitleDiv"
import SelectDate from "@/components/Filters/SelectDate"
import dayjs from "dayjs" // or use native Date
import { useQuery } from "@tanstack/react-query"
import api from "@/api/api"
import { useEffect, useState } from "react"
import {
  format,
  // startOfToday,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  subMonths,
  startOfYear,
  endOfYear,
  parseISO
} from "date-fns"
import { useSelector, useDispatch } from "react-redux"
import { addDate } from "../../../../slices/filterSlices/date"
export default function StockRegisterDetails() {
  const dispatch = useDispatch()
  const { start, end } = useSelector((state) => state.date)
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  )
  const isNotToday = (dateStr) => {
    const date = new Date(dateStr)

    const now = new Date()

    // Get only YYYY-MM-DD for both, ignoring time & tz
    const dateUTC = date.toISOString().split("T")[0]
    const nowUTC = now.toISOString().split("T")[0]

    return dateUTC !== nowUTC
  }
  const { data } = useQuery({
    queryKey: ["stockRegister", cmp_id, start, end],
    queryFn: async () => {
      const res = await api.get(
        `/api/sUsers/stockregisterSummary/${cmp_id}?start=${start}&end=${end}`,
        { withCredentials: true }
      )
      return res.data
    },
    enabled:
      !!cmp_id && !!start && !!end && isNotToday(start) && isNotToday(end),
    staleTime: 30000,
    retry: false
  })
  const today = dayjs().format("YYYY-MM-DD")
  console.log(today)
  console.log(data)
  console.log(start)
  console.log(end)
  const getRangeDates = (rangeType) => {
    let startDate, endDate
    switch (rangeType) {
      case "Today":
        // Use a function that gets the current date at midnight in UTC
        const today = new Date()
        startDate = new Date(
          Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate(),
            0,
            0,
            0,
            0
          )
        )
        endDate = new Date(
          Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate(),
            0,
            0,
            0,
            0
          )
        )
        break

      case "Yesterday":
        startDate = endDate = subDays(new Date(), 1)
        break
      case "This Week":
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 })
        endDate = endOfWeek(new Date(), { weekStartsOn: 1 })
        break
      case "Last Week":
        startDate = startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 })
        endDate = endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 })
        break
      case "Last 7 Days":
        startDate = subDays(new Date(), 6)
        endDate = new Date()
        break
      case "This Month":
        startDate = startOfMonth(new Date())
        endDate = endOfMonth(new Date())
        break
      case "Last Month":
        startDate = startOfMonth(subMonths(new Date(), 1))
        endDate = endOfMonth(subMonths(new Date(), 1))
        break
      case "Last 30 Days":
        startDate = subDays(new Date(), 29)
        endDate = new Date()
        break
      case "This Quarter":
        startDate = startOfQuarter(new Date())
        endDate = endOfQuarter(new Date())
        break
      case "Last Quarter":
        startDate = startOfQuarter(subMonths(new Date(), 3))
        endDate = endOfQuarter(subMonths(new Date(), 3))
        break
      case "Current Financial Year":
        startDate = new Date(new Date().getFullYear(), 3, 1)
        endDate = new Date(new Date().getFullYear() + 1, 2, 31)
        break
      case "Previous Financial Year":
        startDate = new Date(new Date().getFullYear() - 1, 3, 1)
        endDate = new Date(new Date().getFullYear(), 2, 31)
        break
      case "Last Year":
        startDate = startOfYear(subMonths(new Date(), 12))
        endDate = endOfYear(subMonths(new Date(), 12))
        break
      default:
        startDate = endDate = new Date()
    }

    return { start: startDate, end: endDate }
  }
  console.log(start)
  useEffect(() => {
    const { start, end } = getRangeDates("Current Financial Year")
    const newstart = new Date(start)
    const newend = new Date(end)
    const startdate = new Date(
      Date.UTC(
        newstart.getFullYear(),
        newstart.getMonth(),
        newstart.getDate(),
        0,
        0,
        0
      )
    )
    const enddate = new Date(
      Date.UTC(
        newend.getFullYear(),
        newend.getMonth(),
        newend.getDate(),
        0,
        0,
        0
      )
    )
    console.log(start)
    console.log(end)
    dispatch(
      addDate({
        rangeName: "Current Financial Year",
        start: startdate.toISOString(),
        end: enddate.toISOString()
      })
    )
  }, [start])
  return (
    <div className="h-[calc(100vh-10px)] overflow-hidden">
      <TitleDiv title="Stock Details" />
      <SelectDate />
      <div className="px-3 rounded-md">
        <table className="w-full min-w-max border-collapse text-sm rounded-md">
          {/* <thead className={`sticky top-0 z-20 bg-white}> */}
          <thead className="text-sm sticky top-0 z-20 bg-[rgb(51,98,135)] rounded-md shadow-xl text-white">
            <tr>
              <th
                rowSpan="2"
                className="border border-gray-400 p-2 sticky left-0 z-20 bg-[rgb(51,98,135)]"

                // className={`border border-gray-300 p-2 sticky ${ !modalOpen&&left-0  z-10 }bg-gray-100`}
              >
                Item
              </th>
              <th colSpan="3" className="border  border-gray-400 p-1">
                Opening
              </th>
              <th colSpan="3" className="border border-gray-400 p-1 ">
                Inward
              </th>
              <th colSpan="3" className="border border-gray-400 p-2">
                Outward
              </th>

              <th colSpan="3" className="border border-gray-400 p-1">
                Closing
              </th>
            </tr>
            <tr>
              <th className="border border-gray-400 p-1">Quantity</th>
              <th className="border  border-gray-400 p-2">Rate</th>
              <th className="border  border-gray-400 p-2">Amount</th>
              <th className="border border-gray-400 p-1">Quantity</th>
              <th className="border  border-gray-400 p-2">Rate</th>
              <th className="border  border-gray-400 p-2">Amount</th>
              <th className="border border-gray-400 p-1">Quantity</th>
              <th className="border  border-gray-400 p-2">Rate</th>
              <th className="border  border-gray-400 p-2">Amount</th>
              <th className="border border-gray-400 p-1">Quantity</th>
              <th className="border  border-gray-400 p-2">Rate</th>
              <th className="border  border-gray-400 p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {/* {Object.entries(attendee.attendancedates).map(
              ([date, details], idx) => {
                const currentDate = new Date(date)
                const isSunday = currentDate.getDay() === 0 // 0 represents Sunday
                const isHolidayAbsent = holiday.some((holy) => {
                  if (holy.date !== date) return false
                  const matchedItem = attendee.attendancedates[holy.date]
                  if (!matchedItem) return false

                  const notMarkedEmpty = matchedItem.notMarked === ""
                  const hasLeave =
                    matchedItem.compensatoryLeave !== "" ||
                    matchedItem.casualLeave !== "" ||
                    matchedItem.otherLeave !== "" ||
                    matchedItem.privileageLeave !== ""
                  const notMarkedOne = matchedItem.notMarked === 1

                  return (notMarkedEmpty && hasLeave) || notMarkedOne
                })

                const isSundayAbsent = sundays.some((sunday) => {
                  const matched = date === sunday

                  if (!matched) return false
                  if (matched) {
                    const matchedItem = attendee.attendancedates[date]
                    const notMarkedEmpty = matchedItem.notMarked === ""
                    const hasLeave =
                      matchedItem.compensatoryLeave !== "" ||
                      matchedItem.casualLeave !== "" ||
                      matchedItem.otherLeave !== "" ||
                      matchedItem.privileageLeave !== ""
                    const notMarkedOne = matchedItem.notMarked === 1

                    return (notMarkedEmpty && hasLeave) || notMarkedOne
                  }
                })

                const holidayName =
                  holiday.find((h) => h.date === date)?.holyname || null

                const highlightClass =
                  isSundayAbsent || isHolidayAbsent
                    ? "bg-red-500"
                    : "bg-green-300" // Light green background

                return (
                  <tr key={idx} className="hover:bg-gray-50 text-center">
                    <td className="border border-gray-400 p-2 sticky left-0 bg-white">
                      {date}
                    </td>
                    <td
                      className="border border-gray-400 p-2 hover:cursor-pointer"
                      onClick={() => {
                        if (user?.role === "Admin") {
                          handleAttendance(
                            date,
                            "Attendance",
                            details?.inTime,
                            details?.outTime
                          )
                        }
                      }}
                    >
                      {details?.inTime || "-"}
                    </td>
                    <td
                      className="border border-gray-400 p-2 hover:cursor-pointer"
                      onClick={() => {
                        if (user?.role === "Admin") {
                          handleAttendance(
                            date,
                            "Attendance",
                            details?.inTime,
                            details?.outTime
                          )
                        }
                      }}
                    >
                      {details?.outTime || "-"}
                    </td>
                    {isSunday || holidayName ? (
                      <>
                        <td
                          onClick={() => {
                            if (user?.role === "Admin") {
                              handleLeave(
                                date,
                                "Leave",

                                details?.leaveDetails,
                                "casual Leave"
                              )
                            }
                          }}
                          className={` p-2 text-center hover:cursor-pointer border border-r-0 border-gray-400 text-white font-semibold ${highlightClass}`}
                        >
                          {details?.casualLeave}
                        </td>
                        <td
                          onClick={() => {
                            if (user?.role === "Admin") {
                              handleLeave(
                                date,
                                "Leave",

                                details?.leaveDetails,
                                "privileage Leave"
                              )
                            }
                          }}
                          className={` p-2 text-center hover:cursor-pointer border border-r-0 border-l-0 border-gray-400 text-white font-semibold ${highlightClass}`}
                        >
                          {details?.privileageLeave}
                        </td>
                        <td
                          onClick={() => {
                            if (user?.role === "Admin") {
                              handleLeave(
                                date,
                                "Leave",

                                details?.leaveDetails,
                                "compensatory Leave"
                              )
                            }
                          }}
                          className={` p-2 text-center hover:cursor-pointer border border-l-0 border-r-0 border-gray-400 text-white font-semibold ${highlightClass}`}
                        >
                          {details?.compensatoryLeave}
                        </td>
                        <td
                          onClick={() => {
                            if (user?.role === "Admin") {
                              handleLeave(
                                date,
                                "Leave",

                                details?.leaveDetails,
                                "other Leave"
                              )
                            }
                          }}
                          className={` p-2 text-center hover:cursor-pointer border border-l-0 border-r-0 border-gray-400 text-white font-semibold ${highlightClass}`}
                        >
                          {details?.otherLeave}
                        </td>
                        <td
                          className={`p-2  border font-bold border-r-0 border-l-0 border-gray-400 ${highlightClass}`}
                        >
                          {isSunday ? "SUNDAY" : holidayName}
                        </td>
                        <td
                          className={`p-2 text-white  border border-r-0 border-l-0 border-gray-400 ${highlightClass}`}
                        ></td>
                        <td
                          className={`p-2  border border-l-0 border-gray-400 ${highlightClass}`}
                        >
                          {details.notMarked}
                        </td>
                      </>
                    ) : (
                      <>
                        <td
                          className="border border-gray-400  hover:cursor-pointer p-2 "
                          onClick={() => {
                            if (user?.role === "Admin") {
                              const leaveFields = [
                                { key: "casualLeave", label: "Casual Leave" },
                                {
                                  key: "compensatoryLeave",
                                  label: "Compensatory Leave"
                                },
                                {
                                  key: "privileageLeave",
                                  label: "Privileage Leave"
                                },
                                { key: "otherLeave", label: "Other Leave" }
                              ]

                              const leaves = leaveFields
                                .filter(({ key }) => details?.[key])
                                .map(({ key, label }) => ({
                                  type: label,
                                  value: details[key]
                                }))
                              handleLeave(
                                date,
                                "Leave",

                                details?.leaveDetails,
                                "casual Leave"
                              )
                            }
                          }}
                        >
                          {details?.casualLeave || "-"}
                        </td>
                        <td
                          className="border border-gray-400 p-2  hover:cursor-pointer"
                          onClick={() => {
                            if (user?.role === "Admin") {
                              handleLeave(
                                date,
                                "Leave",

                                details?.leaveDetails,
                                "privileage Leave"
                              )
                            }
                          }}
                        >
                          {details?.privileageLeave || "-"}
                        </td>
                        <td
                          className="border border-gray-400 p-2  hover:cursor-pointer"
                          onClick={() => {
                            if (user?.role === "Admin") {
                              handleLeave(
                                date,
                                "Leave",

                                details?.leaveDetails,
                                "compensatory Leave"
                              )
                            }
                          }}
                        >
                          {details?.compensatoryLeave || "-"}
                        </td>
                        <td
                          className="border border-gray-400 p-2 hover:cursor-pointer"
                          onClick={() => {
                            if (user?.role === "Admin") {
                              handleLeave(
                                date,
                                "Leave",

                                details?.leaveDetails,
                                "other Leave"
                              )
                            }
                          }}
                        >
                          {details?.otherLeave || "-"}
                        </td>
                        <td className="border border-gray-400 p-2">
                          {details?.early ? `${details.early} minutes` : "-"}
                        </td>
                        <td className="border border-gray-400 p-2">
                          {details?.late ? `${details.late} minutes` : "-"}
                        </td>
                        <td className="border border-gray-400 p-2 ">
                          {details?.notMarked}
                        </td>
                      </>
                    )}

                    <td
                      className="border border-gray-400 p-2 hover:cursor-pointer"
                      onClick={() => {
                        if (
                          user?.role === "Admin" &&
                          details.onsite.length > 0
                        ) {
                          handleOnsite(
                            date,
                            "Onsite",
                            details?.onsite?.[0]?.onsiteType,

                            details?.onsite?.[0]?.halfDayperiod,

                            details?.onsite?.[0]?.description
                          )
                        }
                      }}
                    >
                      {details?.onsite?.[0]?.place || "-"}
                    </td>
                    <td
                      className="border border-gray-400 p-2 hover:cursor-pointer"
                      onClick={() => {
                        if (
                          user?.role === "Admin" &&
                          details.onsite.length > 0
                        ) {
                          handleOnsite(
                            date,
                            "Onsite",
                            details?.onsite?.[0]?.onsiteType,

                            details?.onsite?.[0]?.halfDayperiod,

                            details?.onsite?.[0]?.description
                          )
                        }
                      }}
                    >
                      {details?.onsite?.[0]?.siteName || "-"}
                    </td>
                    <td
                      className="border border-gray-400 p-2 hover:cursor-pointer"
                      onClick={() => {
                        if (
                          user?.role === "Admin" &&
                          details.onsite.length > 0
                        ) {
                          handleOnsite(
                            date,
                            "Onsite",
                            details?.onsite?.[0]?.onsiteType,

                            details?.onsite?.[0]?.halfDayperiod,

                            details?.onsite?.[0]?.description
                          )
                        }
                      }}
                    >
                      {details?.onsite?.[0]?.onsiteType || "-"}
                    </td>
                    <td
                      className="border border-gray-400 p-2 hover:cursor-pointer"
                      onClick={() => {
                        if (
                          user?.role === "Admin" &&
                          details.onsite.length > 0
                        ) {
                          handleOnsite(
                            date,
                            "Onsite",
                            details?.onsite?.[0]?.onsiteType,

                            details?.onsite?.[0]?.halfDayperiod,

                            details?.onsite?.[0]?.description
                          )
                        }
                      }}
                    >
                      {details?.onsite?.[0]?.onsiteType === "Half Day"
                        ? details?.onsite?.[0].halfDayPeriod
                        : "-"}
                    </td>
                  </tr>
                )
              }
            )} */}
          </tbody>
        </table>
      </div>
    </div>
  )
}
