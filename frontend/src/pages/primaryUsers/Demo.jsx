/* eslint-disable react/prop-types */
import  { useState, useRef, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import ProductDetails from '../../components/common/ProductDetails'; // Adjust the import path as needed

const ProductList = () => {const products = [
  { id: 1, name: 'Product 1', details: 'Details of Product 1 are quite short.' },
  { id: 2, name: 'Product 2', details: 'Details of Product 2 are a bit longer than the previous product. It includes more information about the product.' },
  { id: 3, name: 'Product 3', details: 'Details of Product 3 are extremely long. This product has a lot of specifications and features that need to be explained in great detail. Therefore, the content here is significantly longer than others.' },
  { id: 4, name: 'Product 4', details: 'Details of Product 4.' },
  { id: 5, name: 'Product 5', details: 'Details of Product 5 include medium length content. It has some important information that needs to be conveyed to the user.' },
  { id: 6, name: 'Product 6', details: 'Details of Product 6 are concise.' },
  { id: 7, name: 'Product 7', details: 'Details of Product 7.' },
  { id: 8, name: 'Product 8', details: 'Details of Product 8 have a fair amount of details, enough to make this text long enough to test the dynamic height adjustment in our list.' },
  // Add more products as needed
];

  const [expandedProductId, setExpandedProductId] = useState(null);
  const [heights, setHeights] = useState({});
  const listRef = useRef();

  const toggleDetails = (id) => {
    setExpandedProductId(expandedProductId === id ? null : id);
  };

  const setHeight = useCallback((index, height) => {
    setHeights((prevHeights) => {
      if (prevHeights[index] !== height) {
        return {
          ...prevHeights,
          [index]: height,
        };
      }
      return prevHeights;
    });
  }, []);

  const getItemSize = (index) => {
    const product = products[index];
    const isExpanded = expandedProductId === product.id;
    const baseHeight = isExpanded ? (heights[index] || 100) : 35; // Base height for unexpanded and expanded items
    const extraHeight = isExpanded ? 40 : 0; // Extra height for expanded items
  
    return baseHeight + extraHeight;
  };
  
  const Row = ({ index, style }) => {
    const product = products[index];
    const isExpanded = expandedProductId === product.id;

    return (
      <div style={style} className="flex flex-col border-b border-gray-300">
      <div className="flex justify-between items-center h-9 px-2">
        <span>{product.name}</span>
        <button 
          className="bg-blue-500 text-white px-2 py-1 rounded"
          onClick={() => {
            toggleDetails(product.id);
            // Trigger a re-measure of the list after expanding/collapsing an item
            setTimeout(() => listRef.current.resetAfterIndex(index), 0);
          }}>
          Show
        </button>
      </div>
      {isExpanded && (
        <ProductDetails details={product.details} setHeight={(height) => setHeight(index, height)} />
      )}
    </div>
    );
  };

  return (
    <List
      height={600} // Height of the list container
      itemCount={products.length}
      itemSize={getItemSize}
      width={300} // Width of the list container
      ref={listRef}
    >
      {Row}
    </List>
  );
};

export default ProductList;
