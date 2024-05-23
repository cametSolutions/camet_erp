/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";

function BatchExpansion({ getHeight, index }) {
  const [height, setHeight] = useState(0);
  console.log(index);
  console.log(height);

  const ref = useRef(null);

  useEffect(() => {
    const updateHeight = () => {
      if (ref.current) {
        const boundingBox = ref.current.getBoundingClientRect();
        if (height !== boundingBox.height) {
          setHeight(boundingBox.height);
          getHeight({
            height: boundingBox.height,
            index: index,
          });
        }
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, [height, getHeight, index]);

  return (
    <div ref={ref}>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellendus
      cupiditate eius at et aut, repudiandae sapiente dolores, tempore
      exercitationem autem, officiis odio error eligendi. Doloremque vitae neque
      dolores. Cupiditate, fuga? Eum delectus hic neque iusto harum ex nam
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellendus
      cupiditate eius at et aut, repudiandae sapiente dolores, tempore
      exercitationem autem, officiis odio error eligendi. Doloremque vitae neque
      dolores. Cupiditate, fuga? Eum delectus hic neque iusto harum ex nam
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellendus
      cupiditate eius at et aut, repudiandae sapiente dolores, tempore
      exercitationem autem, officiis odio error eligendi. Doloremque vitae neque
      dolores. Cupiditate, fuga? Eum delectus hic neque iusto harum ex nam
      dolores. Cupiditate, fuga? Eum delectus hic neque iusto harum ex nam
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Repellendus
      cupiditate eius at et aut, repudiandae sapiente dolores, tempore
      exercitationem autem, officiis odio error eligendi. Doloremque vitae neque
      dolores. Cupiditate, fuga? Eum delectus hic neque iusto harum ex nam
     
    </div>
  );
}

export default BatchExpansion;
