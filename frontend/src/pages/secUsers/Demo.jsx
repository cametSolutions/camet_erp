

const Demo = () => {
  return (
    <section className="py-8 bg-gray-100" id="start">
      <div className="container mx-auto relative">
        {/* FORM */}
        <div className="text-center">
          <div className="mb-4 text-xl font-semibold">
            Type the description of your case below
          </div>

          <form id="format" action="Algorithms/article.php" method="GET" className="mb-4">
            <input
              placeholder="Start typing here"
              name="caseInput"
              className="w-full p-3 mb-4 border rounded-lg"
              type="text"
              required
            />
            <button type="submit" className="btn btn-primary w-full py-2 rounded-lg">
              Submit
            </button>
          </form>

          <form id="rank" action="Algorithms/Main2.php" method="GET">
            <button type="submit" className="btn btn-secondary w-full py-2 rounded-lg">
              See rank
            </button>
          </form>

          <div className="mt-4 text-gray-600">
            <i className="fas fa-info-circle"></i> 
          </div>
        </div>
      </div>
    </section>
  );
};

export default Demo;
