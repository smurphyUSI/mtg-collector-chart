import React, { useId, useRef } from "react";

import SelectMenu from "./SelectMenu";

export default function OptionsMenu({ id, optionsList, setSelectedOptions }) {
     const uniqueId = useId();
     const compId = id ? id : uniqueId;

     const chosenOptions = useRef({});

     return (
          <div id={compId} className="compOptionsMenu">
               {(optionsList) &&
               optionsList.map((option, index) => {
                    return (
                         <div key={index} className="selectDropdown">
                              <span>{option.name}:</span>
                              <SelectMenu
                                   list={option.options}
                                   setSelection={(rv) => updateChoices(option.name, rv)}
                              />
                         </div>
                    )
               })}
          </div>
     );

     function updateChoices(name, choice) {
          var newOptions = JSON.parse(JSON.stringify(chosenOptions.current));
          newOptions[name] = choice;
          chosenOptions.current = newOptions;

          if (setSelectedOptions) {
               setSelectedOptions(newOptions);
          }
     }
}