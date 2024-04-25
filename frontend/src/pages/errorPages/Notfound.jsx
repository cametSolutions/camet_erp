import image from "../../assets/images/error.jpg";
import { useNavigate } from "react-router-dom";
const Notfound = ({ message }) => {
  const navigate = useNavigate();
  const goBack = () => {
    navigate(-2);
  };

  return (
    <div className="flex justify-center items-center min-h-screen relative">
      <div>
        <img src={image} alt="" />
      </div>

      <div className="bg-black bg-opacity-50 p-4 rounded-lg text-center absolute">
        <h1 className="text-3xl font-bold text-white mb-4">Error</h1>
        <p className="text-white mb-4">{message}</p>
        <button
          onClick={goBack}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Back
        </button>
      </div>

      {/* <div
        className="min-h-screen  bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="bg-black bg-opacity-50 p-8 rounded-lg text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Error</h1>
          <p className="text-white mb-4">{message}</p>
          <button
            onClick={goBack}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default Notfound;
