/* eslint-disable react/prop-types */

import VoucherCards from "./VoucherCards";

function VoucherSection({ title ,tab}) {
  return (
    <div className="mb-12">
      <div className="md:text-lg font-bold text-gray-500 ml-3 ">{title}</div>
      <hr className="mt-4 border" />
      <section className=" p-1 mt-2 md:py-1 md:px-3">
        <VoucherCards tab={tab}  />
      </section>
    </div>
  );
}

export default VoucherSection;
