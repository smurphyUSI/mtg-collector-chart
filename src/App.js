import React, { useState, useEffect } from "react";
import DataTable from "./DataTable";
import SearchBox from "./SearchBox";
import OptionsMenu from "./OptionsMenu";

const utm_source = 'utm_source=clctrchart';

export default function App() {
     const [cardSetList, setCardSetList] = useState();
     const [symbolsList, setSymbolsList] = useState();
     const [rawCardData, setRawCardData] = useState();
     const [cardData, setCardData] = useState([]);

     const [cardSetName, setCardSetName] = useState();
     const [cardSetCode, setCardSetCode] = useState();
     const [cardSetIcon, setCardSetIcon] = useState();

     const [sortOrder, setSortOrder] = useState();
     const [imageSize, setImageSize] = useState();
     const [prices, setPrices] = useState();

     const [typeFilter, setTypeFilter] = useState();
     const [legalityFilter, setLegalityFilter] = useState();

     const [optionsList, setOptionsList] = useState(() => setInitialOptionsList());
     const [filtersList, setFiltersList] = useState([]);


     function handleSetChange(setProps) {
          setCardSetCode(setProps[1]);
          setCardSetName(setProps[0]);
          setCardSetIcon(setProps[2]);
     }

     function handleOptionsChange(optionProps) {
          (optionProps["Sort Order"]) && setSortOrder(optionProps["Sort Order"]);
          (optionProps["Images"]) && setImageSize(optionProps["Images"]);
          (optionProps["Prices"]) && setPrices(optionProps["Prices"]);
     }

     function handleFiltersChange(filterProps) {
          (filterProps["Type"]) && setTypeFilter(filterProps["Type"]);
          (filterProps["Legality"]) && setLegalityFilter(filterProps["Legality"]);
     }


     useEffect(() => {
          fetchSetList(setCardSetList);
          fetchSymbolsList(setSymbolsList);
     }, []); //Run only once

     useEffect(() => {
          setCardData([]);
          fetchCardData(cardSetCode, undefined, setRawCardData, undefined);
     }, [cardSetCode]);

     useEffect(() => {
          if (rawCardData !== undefined)    {
               processCardData(rawCardData, symbolsList, setFiltersList, setCardData);
          }
     }, [rawCardData, symbolsList]);


     return (
          <div className="compApp">
               <div className="headerBox">
                    <div id="poweredBy">
                         <a target="_blank" rel="noreferrer" href={"https://scryfall.com/?" + utm_source} >Powered by Scryfall</a>
                    </div>
                    <div className="menuBox">
                         <SearchBox id="searchDropdown"
                              placeholder={"Set..."}
                              list={cardSetList}
                              setFoundValue={handleSetChange} 
                         />
                         <OptionsMenu id="optionsMenu"
                              optionsList={optionsList}
                              setSelectedOptions={handleOptionsChange}
                         />
                         <div id="printPage">
                              <button className="compButton"
                                   value="print"
                                   onClick={() => window.print()}>
                                   Print
                              </button>
                         </div>
                    </div>
                    <div className="filterBox">
                         <OptionsMenu id="filtersMenu"
                              optionsList={filtersList}
                              setSelectedOptions={handleFiltersChange}
                         />
                         <div id="digitalInd">
                              <a target="_blank" rel="noreferrer" href={"https://magic.wizards.com/en/mtgarena/?" + utm_source}>Digital Set</a>
                         </div>
                    </div>
               </div>
               <DataTable id="cardDataTable"
                    tableTitle={cardSetName && 
                         <><img src={cardSetIcon} alt="" /> {cardSetName} ({cardSetCode})</>}
                    cardData={cardData}
                    sortOrder={sortOrder}
                    imageSize={imageSize}
                    prices={prices}
                    typeFilter={typeFilter}
                    legalityFilter={legalityFilter}
               />
               <div id="preview-window">
                    <img id="preview-image" src="" alt="" />
               </div>
          </div>
     );
}


function fetchSetList(setState) {
     var outputData = [];
     var query = "https://api.scryfall.com/sets/?" + utm_source;

     var xmlhttp = new XMLHttpRequest();
     xmlhttp.open("GET", query, true);
     xmlhttp.setRequestHeader("Content-Type", "application/json");

     xmlhttp.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
               var response = JSON.parse(this.responseText);
               response.data.forEach((s) => {
                    if (s.digital !== true) {
                         outputData.push([s.name, s.code, s.icon_svg_uri]);
                    }
               });
               setState(outputData);
          }
     };

     xmlhttp.send();
}

function fetchSymbolsList(setState) {
     var symbols = [];
     var query = "https://api.scryfall.com/symbology/";

     var xmlhttp = new XMLHttpRequest();
     xmlhttp.open("GET", query, true);
     xmlhttp.setRequestHeader("Content-Type", "application/json");

     xmlhttp.onreadystatechange = function () {
          if (this.readyState === 4 && this.status === 200) {
               var response = JSON.parse(this.responseText);

               response.data.forEach((s) => {
                    if (s.appears_in_mana_costs === true) {
                         symbols.push({ symbol: s.symbol, image: s.svg_uri });
                    }
               });
               setState(symbols);
          }
     };

     xmlhttp.send();
}


function fetchCardData(setCode, cardData, setState, pageQuery) {
     var newCardData = [];
     var baseQuery =
          "https://api.scryfall.com/cards/search?include_extras=true&include_variations=true&order=set&unique=prints&q=e:";
     if (pageQuery === undefined) {
          pageQuery = baseQuery + setCode + "&" + utm_source;
     }

     if (setCode !== undefined) {
          var xmlhttp = new XMLHttpRequest();
          xmlhttp.open("GET", pageQuery, true);
          xmlhttp.setRequestHeader("Content-Type", "application/json");

          xmlhttp.onreadystatechange = function () {
               if (this.readyState === 4 && this.status === 200) {
                    var response = JSON.parse(this.responseText);
                    if (cardData === undefined) {
                         cardData = [];
                    }
                    newCardData = cardData.concat(response.data);

                    var nextPage = response.next_page;
                    if (nextPage !== undefined) {
                         fetchCardData(
                              setCode,
                              newCardData,
                              setState,
                              nextPage
                         );
                    } else {
                         setState(newCardData);
                    }
               }
          };

          xmlhttp.send();
     }
}


function processCardData(rawCardData, symbolsList, setFiltersState, setState) {
     var processedData = [];
     rawCardData.forEach((e) => {
          e.finishes.forEach((f) => {
               // Transformable Cards
               if (
                    e.card_faces !== undefined &&
                    e.card_faces[0].mana_cost !== undefined
               ) {
                    e.mana_cost = e.card_faces[0].mana_cost;
               }
               if (
                    e.card_faces !== undefined &&
                    e.card_faces[0].image_uris !== undefined
               ) {
                    e.image_uris = e.card_faces[0].image_uris;
               }

               var card = {};
               card.name = e.name;
               card.mana_cost = e.mana_cost;
               card.color_identity = e.color_identity.sort();
               card.type = e.type_line;
               card.rarity = e.rarity;

               // Pull symbols out of the mana cost
               var cost_symbols = [];
               if (e.mana_cost !== null) {
                    var symbols = e.mana_cost.match(/{([^}])*}/g);
                    symbols?.forEach((s => {
                         var sIndex = symbolsList.findIndex(e => (e.symbol === s));
                         if (sIndex !== null)  {
                              cost_symbols.push(symbolsList[sIndex].image);
                         }
                    }))
               }
               card.cost_symbols = cost_symbols;

               // Strip only the legal formats from the card
               var legalities = Object.entries(e.legalities);
               var onlylegal = [];
               legalities.forEach((element) => {
                    if (element[1] === 'legal') {
                         onlylegal.push(element[0]);
                    }
               })
               card.legalities = onlylegal;
               

               var v = {};
               // Number
               v.collector_number = e.collector_number;
               // URL
               v.scryfall_uri = e.scryfall_uri.split("?")[0];
               // Front Image
               if (e.image_uris !== undefined) {
                    v.scryfall_image = e.image_uris.normal;
               }
               // Frame
               if (e.frame_effects !== undefined) {
                    if (e.frame !== undefined) {
                         v.frame = e.frame + "," + e.frame_effects;
                    } else {
                         v.frame = e.frame_effects;
                    }
               } else {
                    if (e.frame !== undefined) {
                         v.frame = e.frame;
                    } else {
                         v.frame = "regular";
                    }
               }
               // Promo
               v.promo = "regular";
               if (e.promo_types !== undefined) {
                    v.promo = e.promo_types[0];
               } else {
                    v.promo = "regular";
               }
               if (e.booster === true) {
                    v.promo = "booster";
               }
               if (e.textless === true) {
                    v.promo = "textless";
               }
               if (e.spotlight === true) {
                    v.promo = "spotlight";
               }
               if (e.full_art === true) {
                    v.promo = "fullart";
               }
               // Finish
               switch (f) {
                    case "nonfoil":
                         v.finish = "nonfoil";
                         v.price_usd = e.prices.usd;
                         break;
                    case "foil":
                         v.finish = "foil";
                         v.price_usd = e.prices.usd_foil;
                         break;
                    case "etched":
                         v.finish = "etched";
                         v.price_usd = e.prices.usd_etched;
                         break;
                    default:
                         v.finish = "unknown";
                         v.price_usd = e.prices.usd;
                         break;
               }

               card.variations = [v];
               processedData.push(card);
          });
     });

     mergeCardData(processedData, setFiltersState, setState);
}

function mergeCardData(cardData, setFiltersState, setState) {
     var mergedData = [];
     cardData.sort(compareCards);
     if (cardData.length > 0) {
          var mergeCard = {};
          mergeCard = cardData[0];
          for (var i = 1; i < cardData.length; i++) {
               if (compareCards(cardData[i], cardData[i - 1]) === 0) {
                    mergeCard.variations.push(cardData[i].variations[0]);
               } else {
                    mergedData.push(mergeCard);
                    mergeCard = cardData[i];
               }
          }
          mergedData.push(mergeCard);
     }

     // For sorting, find the lowest collector number for each card
     mergedData.forEach((card) => {
          var min = 999999;
          for (var i = 0; i < card.variations.length; i++) {
               if (
                    parseInt(
                         card.variations[i].collector_number.replace(/\D/g, "")
                    ) < min
               ) {
                    min = parseInt(
                         card.variations[i].collector_number.replace(/\D/g, "")
                    );
               }
          }
          card.lowest = min;
     });

     // For sorting, total the costs of every variation of a card
     mergedData.forEach((card) => {
          var total_usd = 0.0;
          for (var i = 0; i < card.variations.length; i++) {
               var temp_usd = parseFloat(card.variations[i].price_usd);
               if (temp_usd) {
                    total_usd += temp_usd;
               }
          }

          card.total_usd = total_usd;
     });


     // For filtering, collect all legalites from the cards
     var tempLegalities = {};
     mergedData.forEach((card) => {
          card.legalities.forEach((format) => {
               tempLegalities[format] = true;
          })
     });
     var cardLegalities = [];
     Object.entries(tempLegalities).forEach((e) => {
          if ((e[0]) && (e[1] === true)) {
               cardLegalities.push([e[0].toLowerCase(), e[0].charAt(0).toUpperCase() + e[0].slice(1)]);
          }
     });
     cardLegalities.sort();

     // For filtering, collect all types from the cards
     var tempTypes = {};
     mergedData.forEach((card) => {
          var splitString = card.type.split(/\s|[—]|[-][//]/);
          splitString.forEach((subtype) => {
               tempTypes[subtype] = true;
          })
     });
     var cardTypes = [];
     Object.entries(tempTypes).forEach((e) => {
          if ((e[0]) && (e[1] === true)) {
               cardTypes.push([e[0].toLowerCase(), e[0].charAt(0).toUpperCase() + e[0].slice(1)]);
          }
     });
     cardTypes.sort();

     const newFiltersList = [
          ({name : "Legality",
          options : [["none", "None"], ...cardLegalities]
          }),
          ({name : "Type",
          options : [["none", "None"], ...cardTypes]
          }),
     ];
     setFiltersState(newFiltersList);


     setState(mergedData);
}



function compareCards(a, b) {
     if (a.name < b.name) {
          return -1;
     }
     if (a.name > b.name) {
          return 1;
     }
     return 0;
}


function setInitialOptionsList() {
     const newOptionsList = [
          ({name : "Sort Order",
          options : [
               ["collector", "Collector Number"],
               ["alpha", "Alphabetical"],
               ["rarity", "Rarity"],
               ["color", "Color"],
               ["price", "Price"]
          ]}),
          ({name : "Images",
          options : [
               ["none", "No Images"],
               ["small", "Small Images"],
               ["medium", "Medium Images"],
          ]}),
          ({name : "Prices",
          options : [
               ["none", "No Prices"],
               ["usd", "USD"],
          ]}),
     ];

     return newOptionsList
}
