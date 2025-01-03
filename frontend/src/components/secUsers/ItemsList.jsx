/* eslint-disable react/prop-types */

function ItemsList({ products }) {
  return (
    <div>
      <div className="mt-4 px-4">
        {products.length > 0 ? (
          <div className="grid gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
                // onClick={() => handleProductSelect(product)}
              >
                <h3 className="font-medium">{product.product_name}</h3>
                <div className="text-sm text-gray-600">
                  <p>Code: {product.product_code}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No products found matching
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemsList;
