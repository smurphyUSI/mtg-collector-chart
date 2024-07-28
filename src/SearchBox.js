import React, { useId, useState, useEffect } from "react";

export default function SearchBox({ id, placeholder, list, setFoundValue }) {
     const uniqueId = useId();
     const compId = id ? id : uniqueId;

     const [selectedItem, setSelectedItem] = useState("");
     const [filter, setFilter] = useState("");
     const [filteredList, setFilteredList] = useState();
     const [dropdownVisible, setDropdownVisible] = useState(false);

     function handleSelectionChange(foundValue) {
          setSelectedItem(foundValue);
     }

     function handleFilterChange(newFilterValue) {
          setFilter(newFilterValue);
          setFilteredList(filterList(newFilterValue, list));
     }

     useEffect(() => {
          if (filteredList === undefined) {
               setFilteredList(list);
          }
     }, [list, filteredList]);

     useEffect(() => {
          if (setFoundValue !== undefined) {
               setFoundValue(selectedItem);
          }
     }, [selectedItem, setFoundValue]);



     return (
          <div id={compId} className="compSearchBox">
               <input
                    type="text"
                    value={filter}
                    placeholder={placeholder}
                    onFocus={() => setDropdownVisible(true)}
                    onBlur={() => setDropdownVisible(false)}
                    onChange={(e) => handleFilterChange(e.target.value)}>
               </input>
               {dropdownVisible && (
                    <ul className="searchList">
                         {filteredList?.map((element) => {
                              return (
                                   <li
                                        key={element[1]}
                                        data-value={element[1]}
                                        onMouseDown={(e) =>
                                             handleSelectionChange(
                                                  element
                                             )
                                        }
                                   >
                                        {`${element[0]} (${element[1]})`}
                                   </li>
                              );
                         })}
                    </ul>
               )}
          </div>
     );
}

function filterList(filter, list) {
     var outputList = [];
     var myFilter = filter.toUpperCase();
     for (var i = 0; i < list.length; i++) {
          var txtValue = list[i][0] + list[i][1];
          if (txtValue.toUpperCase().indexOf(myFilter) > -1) {
               outputList.push(list[i]);
          }
     }

     return outputList;
}
