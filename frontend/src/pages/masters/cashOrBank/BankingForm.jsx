import PropTypes from "prop-types";

const BankingForm = ({ 
  formData, 
  setFormData, 
  formType,
}) => {
  const isOD = formType.includes("OD");

  return (
    <form encType="multipart/form-data">
      <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
        {isOD ? "Bank Overdraft Details" : "Bank Details"}
      </h6>
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12 px-4">
          <div className="relative w-full mb-3">
            <label
              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
              htmlFor="bankName"
            >
              Bank Name
            </label>
            <input
              type="text"
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
              onChange={(e) => {
                setFormData({...formData, bank_name: e.target.value});
              }}
              value={formData.bank_name}
              placeholder="Bank Name"
            />
          </div>
        </div>
        <div className="w-full lg:w-12/12 px-4">
          <div className="relative w-full mb-3">
            <label
              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
              htmlFor="acholderName"
            >
              A/C Holder Name
            </label>
            <input
              type="text"
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
              onChange={(e) => {
                setFormData({...formData, acholder_name: e.target.value});
              }}
              value={formData.acholder_name}
              placeholder="A/C Holder Name"
            />
          </div>
        </div>
        <div className="w-full lg:w-12/12 px-4">
          <div className="relative w-full mb-3">
            <label
              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
              htmlFor="acNo"
            >
              A/C Number
            </label>
            <input
              type="number"
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
              onChange={(e) => {
                setFormData({...formData, ac_no: e.target.value});
              }}
              value={formData.ac_no}
              placeholder="A/C Number"
            />
          </div>
        </div>

        <div className="w-full lg:w-12/12 px-4">
          <div className="relative w-full mb-3">
            <label
              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
              htmlFor="branch"
            >
              Branch
            </label>
            <input
              type="text"
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
              onChange={(e) => {
                setFormData({...formData, branch: e.target.value});
              }}
              value={formData.branch}
              placeholder="Branch"
            />
          </div>
        </div>

        <div className="w-full lg:w-12/12 px-4">
          <div className="relative w-full mb-3">
            <label
              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
              htmlFor="opening"
            >
              {isOD ? "OD Opening" : "Bank Opening"}
            </label>
            <input
              type="number"
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
              onChange={(e) => {
                setFormData({...formData, bank_opening: e.target.value});
              }}
              value={formData.bank_opening}
              placeholder={isOD ? "OD Opening" : "Bank Opening"}
            />
          </div>
        </div>

        <div className="w-full lg:w-6/12 px-4">
          <div className="relative w-full mb-3">
            <label
              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
              htmlFor="ifsc"
            >
              IFSC Code
            </label>
            <input
              type="text"
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
              onChange={(e) => {
                setFormData({...formData, ifsc: e.target.value});
              }}
              value={formData.ifsc}
              placeholder="IFSC Code"
            />
          </div>
        </div>

        <div className="w-full lg:w-6/12 px-4">
          <div className="relative w-full mb-3">
            <label
              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
              htmlFor="upiId"
            >
              UPI ID
            </label>
            <input
              type="text"
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
              onChange={(e) => {
                setFormData({...formData, upi_id: e.target.value});
              }}
              value={formData.upi_id}
              placeholder="UPI ID"
            />
          </div>
        </div>

        {/* Add OD-specific fields if the form type is OD */}
        {/* {isOD && (
          <div className="w-full lg:w-6/12 px-4">
            <div className="relative w-full mb-3">
              <label
                className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                htmlFor="odLimit"
              >
                OD Limit
              </label>
              <input
                type="number"
                className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                onChange={(e) => {
                  setFormData({...formData, od_limit: e.target.value});
                }}
                value={formData.od_limit || ""}
                placeholder="OD Limit"
              />
            </div>
          </div>
        )} */}
      </div>
    </form>
  );
};

BankingForm.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  formType: PropTypes.string.isRequired,
  loading: PropTypes.bool
};

export default BankingForm;