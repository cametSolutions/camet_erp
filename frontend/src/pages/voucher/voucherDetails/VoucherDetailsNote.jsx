/* eslint-disable react/prop-types */
export default function VoucherDetailsNote({ note }) {
  return (
    <>
      {note && (
        <div className="px-3 py-2 bg-gray-50 border-b">
          <h2 className=" text-xs sm:text-sm text-gray-800 font-bold">Note</h2>

          <p className="text-xs text-gray-500 mt-4 font-semibold">{note}</p>
        </div>
      )}
    </>
  );
}
