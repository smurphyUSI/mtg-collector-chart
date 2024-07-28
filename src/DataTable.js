import React, { useId, useState, useEffect, useRef } from "react";

export default function DataTable({ id, tableTitle, cardData, sortOrder, imageSize, prices, typeFilter, legalityFilter }) {
     const uniqueId = useId();
     const compId = id ? id : uniqueId;

     const [uniqueTypes, setUniqueTypes] = useState([]);
     const [variationCount, setVariationsCount] = useState(0);
     const tableData = useRef(null);

     useEffect(() => {
          if (cardData.length > 0) {
               setUniqueTypes(findUniqueTypes(cardData));
               setVariationsCount(countVariations(cardData));
               tableData.current = cardData;

               switch (sortOrder) {
                    case 'collector':
                         tableData.current.sort(compareCardsByNumber); break;
                    case 'alpha':
                         tableData.current.sort(compareCardsByName); break;
                    case 'rarity':
                         tableData.current.sort(compareCardsByRarity); break;
                    case 'color':
                         tableData.current.sort(compareCardsByColor); break;                         
                    case 'price':
                         tableData.current.sort(compareCardsByPrice); break;                         
                    default:
                         tableData.current.sort(compareCardsByNumber); break;
               }
          }
     }, [cardData, sortOrder, imageSize, prices, typeFilter, legalityFilter]);


     if (tableData.current) {
          var filteredData = [];
          tableData.current.forEach((rCard) => {
               var tFiltered = false;
               if (typeFilter !== 'none') {
                    tFiltered = true;
                    var splitString = rCard.type.split(/\s|[—]|[-][//]/);
                    splitString.forEach((subtype) => {
                         if (subtype.toLowerCase() === typeFilter) {
                              tFiltered = false;
                         }
                    })
               }
               var lFiltered = false;
               if (legalityFilter !== 'none') {
                    lFiltered = true;
                    rCard.legalities.forEach((legal) => {
                         if (legal.toLowerCase() === legalityFilter) {
                              lFiltered = false;
                         }
                    })
               }
     
               if (!(tFiltered || lFiltered)) {
                    filteredData.push(rCard);
               }
          });

          return (
               <table id={compId} className="compDataTable">
                    <caption>
                         <h1>{tableTitle}</h1>
                         {(tableData.current.length === filteredData.length) ? 
                              <h2>Cards: {tableData.current.length}, Variations: {variationCount}</h2>
                         :
                              <h2>Filtered to:&nbsp;
                                   {(typeFilter === 'none') ?
                                        ""
                                   :
                                        typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) + "'s in "}
                                   {(legalityFilter === 'none') ?
                                        "All"
                                   :
                                        legalityFilter.charAt(0).toUpperCase() + legalityFilter.slice(1)}
                                   {(legalityFilter === 'none') ? " Formats" : " Format"}
                              </h2>
                         }
                    </caption>
                    <thead>
                         <DataTableHeader
                              uniqueData={uniqueTypes}
                         />
                    </thead>
                    <tbody>
                         <DataTableData
                              uniqueData={uniqueTypes}
                              rowData={filteredData}
                              imageSize={imageSize}
                              prices={prices}                         
                         />
                    </tbody>
               </table>
          );
     }
     else {
          return null;
     }
}

function DataTableHeader({uniqueData}) {
     return (
          <>
          <tr>
               <th className="theader-corner" rowSpan="2" colSpan="2"></th>
               {(uniqueData) &&
                    uniqueData.map((element, index) => {
                    if (element.span !== undefined) {
                         var splitText = element.promo + ',' + element.frame;
                         const expression = /([^,]*,[^,]*),/g;
                         splitText = splitText.replace(expression, '$1 ');
                         return (
                              <th key={index} className="theader-top" colSpan={element.span}>
                                   <div className="rotated">
                                        {splitText}
                                   </div>
                              </th>
                         )
                    }
                    else {
                         return null;
                    }
                    })}
          </tr>
          <tr>
               {(uniqueData) &&
                    uniqueData.map((element, index) => {
                         var theClassName;
                         switch (element.finish) {
                              case 'nonfoil': theClassName = 'theader-nonfoil'; break;
                              case 'foil':    theClassName = 'theader-foil'; break;
                              case 'etched':  theClassName = 'theader-etched'; break;
                              default: break;
                         }
                         return (
                              <th key={index} className={theClassName}>
                                   {element.finish}
                              </th>
                         )
                    })}
          </tr>
          </>
     );
}


function DataTableData({uniqueData, rowData, imageSize, prices}) {
     return (
          <>
          {rowData &&
               rowData.map((card, cardIndex) => {

               return (
                    <tr key={cardIndex}>
                         <td className="tdata-title">
                              {card.name}
                              <CostSymbols imgSymbols={card.cost_symbols} altText={card.mana_cost} />
                         </td>
                         <td className={"tdata-rarity tdata-rarity-" + card.rarity}>
                              {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
                         </td>
                         {(uniqueData) &&
                              uniqueData.map((element, index) => {
                              var matchCount = 0;
                              card.variations && card.variations.forEach((varient) => {
                                   if (isSameType(element, varient)) {
                                        matchCount++;
                                   }
                              })

                              return (
                                   (matchCount > 0) ?
                                        <td key={index}>
                                        {card.variations &&
                                             card.variations.map((varient, vIndex) => {
                                                  if (isSameType(element, varient)) {
                                                  return (
                                                       <CardDetails key={vIndex}
                                                            cardVariation={varient}
                                                            imageSize={imageSize}
                                                            prices={prices}
                                                       />
                                                  )}
                                                  else { return null }
                                             })}
                                        </td>
                                        :
                                        <td key={index} className="blankcell"></td>
                                   )
                              })}
                    </tr>
               )
          })}
          </>
     );
}


function CostSymbols({imgSymbols, altText}) {
     return (
          (altText) &&
               <div className="cost-symbols" title={altText}>
                    {imgSymbols?.map((element, index) => {
                         return (
                              <img key={index} src={element} alt="" />
                         )
                    })}
               </div>
     )
}


function CardDetails({cardVariation, imageSize, prices}) {

     function showImage(event) {
          const cardHeight = window.screen.height / 3;
          document.getElementById("preview-image").src = cardVariation.scryfall_image;
          document.getElementById("preview-image").height = cardHeight;
          document.getElementById("preview-window").style.display = "block";
          document.getElementById("preview-window").style.left = (event.pageX + (event.target.clientWidth/2)) + "px";
          document.getElementById("preview-window").style.top = (event.pageY + (event.target.clientHeight/2) - (cardHeight/2)) + "px";
     }

     function hideImage(event) {
          document.getElementById("preview-image").src = "";
          document.getElementById("preview-window").style.display = "none";
     }


     return (
          <a target="_blank"
          rel="noreferrer"
          data-card-image-front={cardVariation.scryfall_image}
          onMouseEnter={showImage}
          onMouseLeave={hideImage}
          href={cardVariation.scryfall_uri}>
               {(imageSize === 'medium') &&
                    <>
                    <img className="inline-medium" src={cardVariation.scryfall_image} alt="" />
                    <br />
                    </>
               }               
               {(imageSize === 'small') &&
                    <>
                    <img className="inline-small" src={cardVariation.scryfall_image.replace('/normal/', '/small/')} alt="" />
                    <br />
                    </>
               }
               {cardVariation.collector_number}
               {(prices === 'usd') &&
                    ((cardVariation.price_usd) ?
                         <>
                         <br />
                         ${cardVariation.price_usd}
                         </>
                    :
                         <>
                         <br />
                         $--.--
                         </>                    
               )}
          </a>
     )
}


/* Helper Functions */
function findUniqueTypes(data) {
     var typeArr = [];
     var uniqueTypes = [];
     data.forEach((e) => {
          e.variations.forEach((v) => {
               typeArr.push({
                    promo: v.promo,
                    frame: v.frame,
                    finish: v.finish,
               });
          });
     });

     // Find and remove duplicates
     typeArr.forEach((item) => {
          var duplicate = uniqueTypes.find(
               (c) =>
                    c.promo === item.promo &&
                    c.frame === item.frame &&
                    c.finish === item.finish
          );
          if (!duplicate) {
               uniqueTypes.push(item);
          }
     });
     uniqueTypes.sort(compareTypes);

     // Create info needed for headers
     uniqueTypes.forEach((item) => {
          var firstIndex = uniqueTypes.findIndex(
               (e) => e.promo === item.promo && e.frame === item.frame
          );
          if (uniqueTypes[firstIndex].span === undefined) {
               uniqueTypes[firstIndex].span = 1;
          } else {
               uniqueTypes[firstIndex].span += 1;
          }
     });

     return uniqueTypes;
}

function compareTypes(a, b) {
     if (a.promo < b.promo) {
          return -1;
     }
     if (a.promo > b.promo) {
          return 1;
     }
     if (a.frame < b.frame) {
          return -1;
     }
     if (a.frame > b.frame) {
          return 1;
     }
     if (a.finish < b.finish) {
          return 1;
     }
     if (a.finish > b.finish) {
          return -1;
     }

     return 0;
}

function isSameType(a, b) {
     if ((a.promo === b.promo) && (a.frame === b.frame) && (a.finish === b.finish)) {
          return true;
     }
     return false;
}

function countVariations(data) {
     var count = 0;
     data.forEach((card) => {
          count += card.variations.length;
     })
     return count;
}


function compareCardsByName(a, b) {
     if (a.name < b.name) {
          return -1;
     }
     if (a.name > b.name) {
          return 1;
     }
     return 0;
}

function compareCardsByNumber(a, b) {
     if (parseInt(a.lowest) < parseInt(b.lowest)) {
          return -1;
     }
     if (parseInt(a.lowest) > parseInt(b.lowest)) {
          return 1;
     }
     return 0;
}

function compareCardsByRarity(a, b) {
     if (a.rarity === b.rarity) {
          return 0;
     }
     if (a.rarity === 'mythic') {
          return -1;
     }
     if (a.rarity === 'rare') {
          if (b.rarity === 'mythic') {
               return 1;
          }
          return -1;
     }
     if (a.rarity === 'uncommon') {
          if (b.rarity === 'common') {
               return -1;
          }
          return 1;
     }
     return 1;
}

function compareCardsByColor(a, b) {
     if (a.color_identity.length > b.color_identity.length) {
          return 1;
     }
     if (a.color_identity.length < b.color_identity.length) {
          return -1;
     }     


     for (var i = 0; i < a.color_identity.length; i++) {
          if (a.color_identity[i] > b.color_identity[i]) {
               return 1;
          }
          if (a.color_identity[i] < b.color_identity[i]) {
               return -1;
          }
     }

     return 0;
}


function compareCardsByPrice(a, b) {
     if (a.total_usd < b.total_usd) {
          return 1;
     }
     if (a.total_usd > b.total_usd) {
          return -1;
     }
     return 0;
}