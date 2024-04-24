import image from "../../assets/images/error.jpg";
import { useNavigate } from "react-router-dom";
const errorPage = ({ message }) =>{
const navigate = useNavigate()
  const goBack = () => {
    navigate(-1)
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center" style={{backgroundImage: `url(${image})`}}>
    <div className="bg-black bg-opacity-50 p-8 rounded-lg text-center">
      <h1 className="text-3xl font-bold text-white mb-4">Error</h1>
      <p className="text-white mb-4">{message}</p>
      <button onClick={goBack} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Go Back
      </button>
    </div>
  </div>
  );
};

export default errorPage;

