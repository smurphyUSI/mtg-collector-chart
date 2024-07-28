import React, { useId, useState, useRef, useEffect } from "react";

export default function SelectMenu({ id, list, setSelection }) {
     const uniqueId = useId();
     const compId = id ? id : uniqueId;

     const [selectedValue, setSelectedValue] = useState();
     var initialSelectedValue = useRef(null);

     useEffect(() => {
          function updateSelected(value) {
               setSelectedValue(value);
               if (setSelection !== undefined) {
                    setSelection(value);
               }
          }

          if (list !== undefined) {
               if (initialSelectedValue.current === null) {
                    initialSelectedValue.current = list[0][0];
                    updateSelected(initialSelectedValue.current);
               } else if (JSON.stringify[
                         initialSelectedValue.current === JSON.stringify(list)
               ]) {
                    initialSelectedValue.current = list[0][0];
                    updateSelected(initialSelectedValue.current);
               }
          }
     }, [list, setSelection]);


     function handleSelectedChange(newSelectedValue) {
          setSelectedValue(newSelectedValue);
          if (setSelection !== undefined) {
               setSelection(newSelectedValue);
          }
     }

     return (
          <select id={compId} className="compSelectMenu"
               value={selectedValue}
               onChange={(e) => handleSelectedChange(e.target.value)}>
               {list?.map((element) => {
                    return (
                         <option key={element[0]} value={element[0]}>
                              {element[1]}
                         </option>
                    );
               })}
          </select>
     );
}
