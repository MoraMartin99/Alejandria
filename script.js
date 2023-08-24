/* Variables globales */
/* ----------------------------------------------------------------------------------------------------------------- */
const body = document.querySelector("body");
const main = document.querySelector("main");
const filterButtonWrapperArr = Array.from(document.querySelectorAll(".filterButtonWrapper"));
const menuWrapperArr = Array.from(document.querySelectorAll(".menuWrapper"));
const buttonAreaArr = Array.from(document.querySelectorAll(".buttonArea"));
const mobileButtonArea = document.querySelector("body > .buttonArea");
let hideMenuByOutsideClickHandler;
const user = { bookArr: [], currentSet: { restrictionArr: [], bookArr: [] } };
/* ----------------------------------------------------------------------------------------------------------------- */

/* Funciones generales */
/* ----------------------------------------------------------------------------------------------------------------- */

const removeClass = (element, classArr) => {
    classArr.forEach((currentClass) => {
        element.classList.remove(currentClass);
    });
};

const addClass = (element, classArr) => {
    classArr.forEach((currentClass) => {
        element.classList.add(currentClass);
    });
};

const removeElement = (elementArr) => {
    elementArr.forEach((element) => {
        element.remove();
    });
};

const removeBookObjArr = (bookCardIDArr, userBookObjArr) => {
    bookCardIDArr.forEach((bookCardID) => {
        const index = userBookObjArr.findIndex((BookObj) => {
            return BookObj.id === bookCardID;
        });

        userBookObjArr.splice(index, 1);
    });
};

const getRandomNumberArr = (min, max, n = 1) => {
    let arr = [];
    let newNumber;
    const delta = () => {
        return Math.round((max - min) * Math.random());
    };
    while (arr.length != n) {
        newNumber = min + delta();
        if (!arr.includes(newNumber)) {
            arr.push(newNumber);
        }
    }
    return arr;
};

const hideMenuByOutsideClick = (targetElement, hideActionsCallback, exceptionElementArr = undefined) => {
    hideMenuByOutsideClickHandler = (e) => {
        const target = e.target;

        if (!targetElement.contains(target)) {
            body.removeEventListener("click", hideMenuByOutsideClickHandler);
            if (exceptionElementArr) {
                hideActionsCallback(exceptionElementArr);
            } else {
                hideActionsCallback();
            }
        }
    };

    body.addEventListener("click", hideMenuByOutsideClickHandler);
};

const hideArrofElements = (CSSSelectorArr, aditionalActionCallBack = undefined) => {
    const arr = CSSSelectorArr.reduce((result, item) => {
        let elementArr = Array.from(document.querySelectorAll(`${item}`));

        if (elementArr.length > 0) {
            result.push(...elementArr);
        }

        return result;
    }, []);

    arr.forEach((item) => {
        if (aditionalActionCallBack) {
            aditionalActionCallBack(item);
        } else {
            removeClass(item, ["show"]);
        }
    });
};

const updateAncestorZIndex = (childElement, ancestorCSSSelector, newZIndex) => {
    const ancestor = childElement.closest(ancestorCSSSelector);
    ancestor.style.zIndex = newZIndex;
};

const updateElementZIndex = (element, newZIndex = "auto") => {
    element.style.zIndex = newZIndex;
};

const hideAllMenuInterfaces = (exceptionElementArr = undefined) => {
    const CSSSelectorArr = [".show"];
    const resetBookCard = (bookStateDropdownContainerElement) => {
        updateBookCard(bookStateDropdownContainerElement);
    };
    const resetFilterMenu = (filterMenuElement) => {
        const ancestorElementCSS = document.querySelector("header").contains(filterMenuElement) ? "header" : "footer";
        filterMenuElement.removeEventListener("click", filterMenuClickableOptionsHandler);
        updateAncestorZIndex(filterMenuElement, ancestorElementCSS, "auto");
    };

    const resetBookEntryMenuBookStateDropdown = (bookStateDropdownContainerElement) => {
        updateAncestorZIndex(bookStateDropdownContainerElement, ".menuBookStateContainer", "auto");
        updateAncestorZIndex(bookStateDropdownContainerElement, ".bookStateDropdownContainer", "auto");
        updateDropDownMenuText(bookStateDropdownContainerElement);
    };

    const resetMenuWrapper = (menuWrapperElement) => {
        const bookCardSelectedArr = Array.from(document.querySelectorAll(".bookCard.selected"));

        if (menuWrapperElement.matches("#deleteWrapper")) {
            menuWrapperElement.removeEventListener("click", deleteWrapperClickHandler);
        } else {
            menuWrapperElement.removeEventListener("click", menuWrapperClickHandler);
            menuWrapperElement.removeEventListener("focusout", menuWrapperFocusoutHandler);
            body.style.overflow = "initial";

            bookCardSelectedArr.forEach((item) => {
                removeClass(item, ["selected"]);
            });
        }
    };

    const hideHandler = (element) => {
        if (exceptionElementArr) {
            if (
                exceptionElementArr.some((exceptionElement) => {
                    return exceptionElement === element;
                })
            ) {
                return;
            }
        }

        removeClass(element, ["show"]);

        if (element.matches(".bookCard .bookStateDropdownContainer")) {
            resetBookCard(element);
        }

        if (element.matches(".filterMenu")) {
            resetFilterMenu(element);
        }

        if (element.matches(".bookEntryMenu .bookStateDropdownContainer")) {
            resetBookEntryMenuBookStateDropdown(element);
        }

        if (element.matches(".menuWrapper")) {
            resetMenuWrapper(element);
        }
    };

    hideArrofElements(CSSSelectorArr, hideHandler);
    body.removeEventListener("click", hideMenuByOutsideClickHandler);
};

const setRestriction = (restrictionObj, destinationArr) => {
    const type = restrictionObj.type;
    const index = destinationArr.findIndex((item) => {
        return item.type === type;
    });

    if (index !== -1) {
        destinationArr.splice(index, 1);
    }

    destinationArr.push(restrictionObj);
};

const deleteRestriction = (type, destinationArr) => {
    const index = destinationArr.findIndex((item) => {
        return item.type === type;
    });

    if (index !== -1) {
        destinationArr.splice(index, 1);
    }
};

/* ----------------------------------------------------------------------------------------------------------------- */

/* Object Constructors */
/* ----------------------------------------------------------------------------------------------------------------- */
function Book(title, author, nPages, state) {
    const bookArr = user.bookArr;
    const regex = /(?<=hsl\()\d+/;
    const tolerance = 30;
    let lastObjHue;
    let hue;
    let lasIndex;

    if (bookArr.length) {
        lasIndex = bookArr.length - 1;
        lastObjHue = parseInt(bookArr[lasIndex].color.bookBaseImgColor.match(regex)[0]);
        hue = getRandomHue([22, lastObjHue], tolerance);
    } else {
        hue = getRandomHue([22], tolerance);
    }

    this.title = title;
    this.author = author;
    this.nPages = nPages;
    this.state = state;
    this.id = getBookCardID();
    this.color = {
        bookBaseImgColor: getHSLColor(hue, 100, 70),
        bookSideImgColor: getHSLColor(hue, 93, 28),
        bookTitleImgColor: "#000000",
    };
}

function Restriction(type, testHandler, testArr) {
    this.type = type;
    this.testHandler = testHandler;
    this.testArr = testArr;
}
/* ----------------------------------------------------------------------------------------------------------------- */

/* Funciones auxiliares para Object Constructors */
/* ----------------------------------------------------------------------------------------------------------------- */

const getHSLColor = (hue, saturation, lightness, opacity = undefined) => {
    let HSLColor;

    if (typeof opacity === "number") {
        HSLColor = `hsl(${hue} ${saturation}% ${lightness}% / ${opacity})`;
    } else {
        HSLColor = `hsl(${hue} ${saturation}% ${lightness}%)`;
    }

    return HSLColor;
};

const getBookCardID = () => {
    const length = user.bookArr.length;
    const lastIndex = user.bookArr.length - 1;
    const regex = /\d+$/;
    let lastObjIDNumber;

    if (!length) {
        return `bookCard${length + 1}`;
    } else {
        lastObjIDNumber = parseInt(user.bookArr[lastIndex].id.match(regex)[0]);
        return `bookCard${lastObjIDNumber + 1}`;
    }
};

const getRandomHue = (exceptionHueArr = undefined, tolerance = 1) => {
    let hue = getRandomNumberArr(0, 360)[0];

    if (exceptionHueArr) {
        while (
            !exceptionHueArr.every((item) => {
                return hue < item - tolerance || hue > item + tolerance;
            })
        ) {
            hue = getRandomNumberArr(0, 360)[0];
        }
    }

    return hue;
};

/* ----------------------------------------------------------------------------------------------------------------- */

/* main */
/* ----------------------------------------------------------------------------------------------------------------- */
const mainClickHandler = (e) => {
    const target = e.target;
    const currentTarget = e.currentTarget;
    const editMenuWrapperElement = document.querySelector("#editMenuWrapper");
    const bookCardElement = target.closest(".bookCard");
    let bookCardSelectedElement;

    /* click en bookStateDropdownContainer */
    if (target.matches(".bookStateDropdownContainer, .bookStateDropdownContainer *")) {
        bookCardDropDownMenuHandler(target);
        return;
    }

    /* click en editButton */
    if (target.matches(".editButton, .editButton *")) {
        addClass(bookCardElement, ["selected"]);
        bookCardSelectedElement = document.querySelector(".bookCard.selected");
        showBookEntryMenu(editMenuWrapperElement);
        loadBookEntryMenu(editMenuWrapperElement, bookCardSelectedElement);
        return;
    }
};

const bookCardDropDownMenuHandler = (target) => {
    const bookStateDropdownContainer = target.closest(".bookStateDropdownContainer");
    const activationElement = bookStateDropdownContainer.querySelector(".dropdownBaseContainer");
    const clickableAreaElement = bookStateDropdownContainer.querySelector(".stateOptionContainer");
    const bookCardElement = target.closest(".bookCard");
    const id = bookCardElement.id;
    const bookObj = user.bookArr.find((item) => {
        return item.id === id;
    });

    /* Activación del menu */
    if (activationElement.contains(target) && !activationElement.classList.contains("show")) {
        hideAllMenuInterfaces();
        addClass(bookStateDropdownContainer, ["show"]);
        updateBookCard(bookStateDropdownContainer);
        hideMenuByOutsideClick(bookStateDropdownContainer, hideAllMenuInterfaces);
    }

    /* Configurar el click en stateOption */
    if (clickableAreaElement.contains(target)) {
        const closestOption = target.closest(".stateOption");
        const dataValue = closestOption.getAttribute("data-value");

        body.removeEventListener("click", hideMenuByOutsideClickHandler);
        bookStateDropdownContainer.setAttribute("data-value", dataValue);
        removeClass(bookStateDropdownContainer, ["show"]);
        updateBookCard(bookStateDropdownContainer);
        bookObj.state = dataValue;
    }
};

const updateDropDownMenuText = (DropDownMenuElement) => {
    const optionTextValue = {
        wantToRead: { value: "Quiero leer", class: "wantToRead" },
        read: { value: "Leído", class: "read" },
        reading: { value: "Leyendo", class: "reading" },
        default: { value: "Seleccionar" },
    };
    const optionTextElement = DropDownMenuElement.querySelector(".optionText");
    const DropDownMenuDataValue = DropDownMenuElement.getAttribute("data-value");

    if (!DropDownMenuDataValue || DropDownMenuElement.matches(".show")) {
        optionTextElement.textContent = optionTextValue.default.value;
        return;
    }
    optionTextElement.textContent = optionTextValue[DropDownMenuDataValue].value;
};

const updateBookCard = (DropDownMenuElement) => {
    const newZIndex = "100";
    const ancestorCSSSelector = ".bookCard";

    updateDropDownMenuText(DropDownMenuElement);
    if (DropDownMenuElement.matches(".show")) {
        updateAncestorZIndex(DropDownMenuElement, ancestorCSSSelector, newZIndex);
    } else {
        updateAncestorZIndex(DropDownMenuElement, ancestorCSSSelector, "auto");
        updateIndicator();
    }
};

/* ----------------------------------------------------------------------------------------------------------------- */

/* DropDownMenu */
/* ----------------------------------------------------------------------------------------------------------------- */

const bookEntryMenuDropDownMenuHandler = (target) => {
    const bookStateDropdownContainer = target.closest(".bookStateDropdownContainer");
    const activationElement = bookStateDropdownContainer.querySelector(".dropdownBaseContainer");
    const clickableAreaElement = bookStateDropdownContainer.querySelector(".stateOptionContainer");
    const baseMenuElement = bookStateDropdownContainer.closest(".menuWrapper");

    /* Activación del menu */
    if (activationElement.contains(target) && !activationElement.classList.contains("show")) {
        hideAllMenuInterfaces([baseMenuElement]);
        addClass(bookStateDropdownContainer, ["show"]);
        updateDropDownMenuText(bookStateDropdownContainer);
        updateAncestorZIndex(bookStateDropdownContainer, ".menuBookStateContainer", "100");
        updateAncestorZIndex(bookStateDropdownContainer, ".bookStateDropdownContainer", "100");
        hideMenuByOutsideClick(bookStateDropdownContainer, hideAllMenuInterfaces, [baseMenuElement]);
    }

    /* Configurar el click en stateOption */
    if (clickableAreaElement.contains(target)) {
        const closestOption = target.closest(".stateOption");
        const dataValue = closestOption.getAttribute("data-value");
        const inputElement = bookStateDropdownContainer.closest(".menuInputWrapper").querySelector(".menuInputBar");

        body.removeEventListener("click", hideMenuByOutsideClickHandler);
        bookStateDropdownContainer.setAttribute("data-value", dataValue);
        inputElement.value = dataValue;
        activateTextInput(inputElement);
        removeClass(bookStateDropdownContainer, ["show"]);
        updateDropDownMenuText(bookStateDropdownContainer);
        updateAncestorZIndex(bookStateDropdownContainer, ".menuBookStateContainer", "auto");
        updateAncestorZIndex(bookStateDropdownContainer, ".bookStateDropdownContainer", "auto");
    }
};

/* ----------------------------------------------------------------------------------------------------------------- */

/* menuWrapper */
/* ----------------------------------------------------------------------------------------------------------------- */

const menuWrapperClickHandler = (e) => {
    const target = e.target;
    const currentTarget = e.currentTarget;
    const bookStateDropdownContainerElement = currentTarget.querySelector(".bookStateDropdownContainer");
    const cancelButton = currentTarget.querySelector(".cancelButton");
    const acceptButton = currentTarget.querySelector(".acceptButton");
    const menuDeleteContainer = currentTarget.querySelector(".menuDeleteContainer");
    const bookEntryMenuElement = currentTarget.querySelector(".bookEntryMenu");
    const deleteWrapper = document.querySelector("#deleteWrapper");

    if (!bookEntryMenuElement.contains(target)) {
        hideAllMenuInterfaces();
        return;
    }

    if (bookStateDropdownContainerElement.contains(target)) {
        bookEntryMenuDropDownMenuHandler(target);
        return;
    }

    if (cancelButton.contains(target)) {
        resetBookEntryMenuValues(currentTarget);
        hideAllMenuInterfaces();
        return;
    }

    if (acceptButton.contains(target)) {
        e.preventDefault();

        if (testBookEntryMenuValidity(bookEntryMenuElement)) {
            validBookEntryMenuHandler(bookEntryMenuElement, target);
            resetBookEntryMenuValues(currentTarget);
            hideAllMenuInterfaces();
        }

        return;
    }

    if (menuDeleteContainer) {
        if (menuDeleteContainer.contains(target)) {
            showDeleteWrapper(deleteWrapper);
            return;
        }
    }
};

const menuWrapperFocusoutHandler = (e) => {
    const target = e.target;
    const currentTarget = e.currentTarget;
    const menuInputBarArr = Array.from(currentTarget.querySelectorAll(".menuInputBar"));

    if (
        menuInputBarArr.some((menuInputBar) => {
            return menuInputBar.contains(target);
        })
    ) {
        const closestMenuInputBarElement = target.closest(".menuInputBar");
        activateTextInput(closestMenuInputBarElement);
    }
};

const showBookEntryMenu = (menuWrapperElement) => {
    hideAllMenuInterfaces();
    body.style.overflow = "hidden";
    addClass(menuWrapperElement, ["show"]);
    menuWrapperElement.addEventListener("click", menuWrapperClickHandler);
    menuWrapperElement.addEventListener("focusout", menuWrapperFocusoutHandler);
};

const loadBookEntryMenu = (menuWrapperElement, bookCardElement) => {
    const bookCardTitle = bookCardElement.querySelector(".bookTitle").innerText;
    const bookCardAuthor = bookCardElement.querySelector(".bookAuthor").innerText;
    const bookCardPages = bookCardElement.querySelector(".bookPages").innerText.match(/^\d+/)[0];
    const bookCardState = bookCardElement.querySelector(".bookStateDropdownContainer").getAttribute("data-value");
    const title = menuWrapperElement.querySelector(".menuInputContainer:nth-last-child(5) .menuInputBar");
    const author = menuWrapperElement.querySelector(".menuInputContainer:nth-last-child(4) .menuInputBar");
    const nPages = menuWrapperElement.querySelector(".menuInputContainer:nth-last-child(3) .menuInputBar");
    const state = menuWrapperElement.querySelector(".menuInputContainer:nth-last-child(2) .menuInputBar");
    const bookStateDropdownContainer = menuWrapperElement.querySelector(".bookStateDropdownContainer");

    title.value = bookCardTitle;
    author.value = bookCardAuthor;
    nPages.value = bookCardPages;
    state.value = bookCardState;
    bookStateDropdownContainer.setAttribute("data-value", bookCardState);
    updateDropDownMenuText(bookStateDropdownContainer);
};

const showDeleteWrapper = (wrapperElement) => {
    const baseWrapperElement = document.querySelector("#editMenuWrapper");
    hideAllMenuInterfaces([baseWrapperElement]);
    addClass(wrapperElement, ["show"]);
    wrapperElement.addEventListener("click", deleteWrapperClickHandler);
};

const deleteWrapperClickHandler = (e) => {
    const target = e.target;
    const currentTarget = e.currentTarget;
    const menuElement = currentTarget.querySelector(".deleteMenu");
    const baseWrapperElement = document.querySelector("#editMenuWrapper");
    const cancelButton = currentTarget.querySelector(".cancelButton");
    const acceptButton = currentTarget.querySelector(".acceptButton");
    const bookCardSelectedElement = document.querySelector(".bookCard.selected");

    if (!menuElement.contains(target)) {
        hideAllMenuInterfaces([baseWrapperElement]);
        return;
    }

    if (cancelButton.contains(target)) {
        hideAllMenuInterfaces([baseWrapperElement]);
        return;
    }

    if (acceptButton.contains(target)) {
        deleteBookCard(bookCardSelectedElement);
        resetBookEntryMenuValues(baseWrapperElement);
        hideAllMenuInterfaces();
        return;
    }
};

const deleteBookCard = (bookCardElement) => {
    removeBookObjArr([bookCardElement.id], user.bookArr);
    removeElement([bookCardElement]);
    updateIndicator();
};

const resetBookEntryMenuValues = (bookEntryMenuElement) => {
    const inputElementArr = Array.from(bookEntryMenuElement.querySelectorAll(`input`));
    const bookStateDropdownContainerElement = bookEntryMenuElement.querySelector(".bookStateDropdownContainer");

    inputElementArr.forEach((item) => {
        item.value = "";
        removeClass(item, ["activatedInput"]);
    });

    bookStateDropdownContainerElement.setAttribute("data-value", "");
    updateDropDownMenuText(bookStateDropdownContainerElement);
};

const activateTextInput = (textInputElement) => {
    addClass(textInputElement, ["activatedInput"]);
};

const testBookEntryMenuValidity = (bookEntryMenuElement) => {
    const menuInputBarArr = Array.from(bookEntryMenuElement.querySelectorAll(".menuInputBar"));

    menuInputBarArr.forEach((input) => {
        activateTextInput(input);
    });

    return bookEntryMenuElement.reportValidity();
};

const validBookEntryMenuHandler = (bookEntryMenuElement) => {
    const bookArr = user.bookArr;
    const bookCardSelectedElement = document.querySelector(".bookCard.selected");
    let bookStateDropdownContainerElement;

    if (bookEntryMenuElement.matches("#addMenu")) {
        addBookCardObj(bookEntryMenuElement, bookArr);
        addBookCardElement(main, bookArr, bookArr.length - 1);
    } else if (bookEntryMenuElement.matches("#editMenu")) {
        editBookCardObj(bookEntryMenuElement, bookArr, bookCardSelectedElement.id);
        rebuildBookCardElement(bookCardSelectedElement);
        bookStateDropdownContainerElement = bookCardSelectedElement.querySelector(".bookStateDropdownContainer");
        updateBookCard(bookStateDropdownContainerElement);
    }
};

const getBookCardElement = (bookObj) => {
    const bookCard = document.createElement("div");
    const pages = bookObj.nPages === "1" ? `${bookObj.nPages} página` : `${bookObj.nPages} páginas`;
    const innerHTML = `<svg
                    class="bookCover"
                    viewBox="0 0 70 90"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:svg="http://www.w3.org/2000/svg"
                >
                    <g class="bookGroup">
                        <path id="rect4" style="fill: ${bookObj.color.bookBaseImgColor}" class="bookBaseImg" d="M 0,0 H 70 V 90 H 0 Z" />
                        <path id="rect8" style="fill: ${bookObj.color.bookSideImgColor}" class="bookSideImg" d="M 0,0 H 10 V 90 H 0 Z" />
                        <path
                            class="bookTitleImg"
                            d="m 39.386719,17.642578 -1.41211,10.121094 h 0.908203 l 0.251954,-1.021484 c 0.293771,0.909999 0.88062,1.191406 1.580078,1.191406 1.370934,0 2.839844,-1.596707 2.839844,-4.970703 0,-1.889999 -0.782213,-2.730469 -1.859376,-2.730469 -0.6435,0 -1.132793,0.307813 -1.65039,1.007812 l 0.488281,-3.597656 z M 33.875,18.160156 29.482422,27.763672 h 1.216797 l 0.964843,-2.140625 h 3.847657 L 35.875,27.763672 h 1.273438 l -1.69336,-9.603516 z m 0.615234,1.007813 h 0.05664 c 0,0 0.01436,0.742453 0.07031,1.064453 l 0.71289,4.269531 h -3.162109 l 1.93164,-4.269531 c 0.139891,-0.308 0.390625,-1.064453 0.390625,-1.064453 z m 12.898438,1.064453 c -2.392142,0 -2.923828,2.855393 -2.923828,5.02539 0,1.833999 0.867029,2.675782 2.251953,2.675782 1.496836,0 2.365016,-1.359424 2.546875,-2.857422 h -1.148438 c -0.111913,0.965999 -0.64239,1.833984 -1.425781,1.833984 -0.671478,0 -1.035156,-0.644001 -1.035156,-1.75 0,-0.783999 0.19557,-3.90625 1.734375,-3.90625 0.615521,0 0.908203,0.560672 0.908203,1.638672 v 0.238281 h 1.189453 v -0.251953 c 0,-1.805999 -0.726721,-2.646484 -2.097656,-2.646484 z m -6.042969,1.021484 c 0.685467,0 1.035156,0.533657 1.035156,1.597656 0,1.203999 -0.337147,4.058594 -1.833984,4.058594 -0.685467,0 -1.019531,-0.532032 -1.019531,-1.582031 0,-1.119999 0.36349,-4.074219 1.818359,-4.074219 z"
                            style="fill: ${bookObj.color.bookTitleImgColor}; fill-opacity: 1"
                        />
                    </g>
                </svg>
                <button class="editButton">Editar</button>
                <div class="infoContainer">
                    <p class="bookTitle">${bookObj.title}</p>
                    <p class="bookAuthor">${bookObj.author}</p>
                    <p class="bookPages">${pages}</p>
                </div>
                <div data-value="${bookObj.state}" class="bookStateDropdownContainer">
                    <div class="dropdownBaseContainer">
                        <p class="optionText">Seleccionar</p>
                    </div>
                    <div class="stateOptionContainer">
                        <div data-value="wantToRead" class="stateOption">Quiero leer</div>
                        <div data-value="read" class="stateOption">Leído</div>
                        <div data-value="reading" class="stateOption">Leyendo</div>
                    </div>
                </div>`;

    bookCard.innerHTML = innerHTML;
    bookCard.classList.add("bookCard");
    bookCard.id = bookObj.id;
    return bookCard;
};

const addBookCardObj = (bookEntryMenuElement, destinationArr) => {
    const title = bookEntryMenuElement.querySelector(".menuInputContainer:nth-last-child(5) .menuInputBar").value;
    const author = bookEntryMenuElement.querySelector(".menuInputContainer:nth-last-child(4) .menuInputBar").value;
    const nPages = bookEntryMenuElement.querySelector(".menuInputContainer:nth-last-child(3) .menuInputBar").value;
    const state = bookEntryMenuElement.querySelector(".menuInputContainer:nth-last-child(2) .menuInputBar").value;
    const bookObj = new Book(title, author, nPages, state);

    destinationArr.push(bookObj);
};

const addBookCardElement = (parentElement, bookCardObjArr, index = undefined) => {
    let childElement;
    let bookStateDropdownContainerElement;

    if (index) {
        childElement = getBookCardElement(bookCardObjArr[index]);
        bookStateDropdownContainerElement = childElement.querySelector(".bookStateDropdownContainer");
        parentElement.appendChild(childElement);
        updateBookCard(bookStateDropdownContainerElement);
    } else {
        bookCardObjArr.forEach((obj) => {
            childElement = getBookCardElement(obj);
            bookStateDropdownContainerElement = childElement.querySelector(".bookStateDropdownContainer");
            parentElement.appendChild(childElement);
            updateBookCard(bookStateDropdownContainerElement);
        });
    }
};

const editBookCardObj = (bookEntryMenuElement, destinationArr, bookCardID) => {
    const title = bookEntryMenuElement.querySelector(".menuInputContainer:nth-last-child(5) .menuInputBar").value;
    const author = bookEntryMenuElement.querySelector(".menuInputContainer:nth-last-child(4) .menuInputBar").value;
    const nPages = bookEntryMenuElement.querySelector(".menuInputContainer:nth-last-child(3) .menuInputBar").value;
    const state = bookEntryMenuElement.querySelector(".menuInputContainer:nth-last-child(2) .menuInputBar").value;
    const bookObj = user.bookArr.find((item) => {
        return item.id === bookCardID;
    });

    bookObj.title = title;
    bookObj.author = author;
    bookObj.nPages = nPages;
    bookObj.state = state;
};

const rebuildBookCardElement = (bookCardElement) => {
    const id = bookCardElement.id;
    const bookObj = user.bookArr.find((item) => {
        return item.id === id;
    });
    const pages = bookObj.nPages === "1" ? `${bookObj.nPages} página` : `${bookObj.nPages} páginas`;
    const innerHTML = `<svg
                    class="bookCover"
                    viewBox="0 0 70 90"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:svg="http://www.w3.org/2000/svg"
                >
                    <g class="bookGroup">
                        <path id="rect4" style="fill: ${bookObj.color.bookBaseImgColor}" class="bookBaseImg" d="M 0,0 H 70 V 90 H 0 Z" />
                        <path id="rect8" style="fill: ${bookObj.color.bookSideImgColor}" class="bookSideImg" d="M 0,0 H 10 V 90 H 0 Z" />
                        <path
                            class="bookTitleImg"
                            d="m 39.386719,17.642578 -1.41211,10.121094 h 0.908203 l 0.251954,-1.021484 c 0.293771,0.909999 0.88062,1.191406 1.580078,1.191406 1.370934,0 2.839844,-1.596707 2.839844,-4.970703 0,-1.889999 -0.782213,-2.730469 -1.859376,-2.730469 -0.6435,0 -1.132793,0.307813 -1.65039,1.007812 l 0.488281,-3.597656 z M 33.875,18.160156 29.482422,27.763672 h 1.216797 l 0.964843,-2.140625 h 3.847657 L 35.875,27.763672 h 1.273438 l -1.69336,-9.603516 z m 0.615234,1.007813 h 0.05664 c 0,0 0.01436,0.742453 0.07031,1.064453 l 0.71289,4.269531 h -3.162109 l 1.93164,-4.269531 c 0.139891,-0.308 0.390625,-1.064453 0.390625,-1.064453 z m 12.898438,1.064453 c -2.392142,0 -2.923828,2.855393 -2.923828,5.02539 0,1.833999 0.867029,2.675782 2.251953,2.675782 1.496836,0 2.365016,-1.359424 2.546875,-2.857422 h -1.148438 c -0.111913,0.965999 -0.64239,1.833984 -1.425781,1.833984 -0.671478,0 -1.035156,-0.644001 -1.035156,-1.75 0,-0.783999 0.19557,-3.90625 1.734375,-3.90625 0.615521,0 0.908203,0.560672 0.908203,1.638672 v 0.238281 h 1.189453 v -0.251953 c 0,-1.805999 -0.726721,-2.646484 -2.097656,-2.646484 z m -6.042969,1.021484 c 0.685467,0 1.035156,0.533657 1.035156,1.597656 0,1.203999 -0.337147,4.058594 -1.833984,4.058594 -0.685467,0 -1.019531,-0.532032 -1.019531,-1.582031 0,-1.119999 0.36349,-4.074219 1.818359,-4.074219 z"
                            style="fill: ${bookObj.color.bookTitleImgColor}; fill-opacity: 1"
                        />
                    </g>
                </svg>
                <button class="editButton">Editar</button>
                <div class="infoContainer">
                    <p class="bookTitle">${bookObj.title}</p>
                    <p class="bookAuthor">${bookObj.author}</p>
                    <p class="bookPages">${pages}</p>
                </div>
                <div data-value="${bookObj.state}" class="bookStateDropdownContainer">
                    <div class="dropdownBaseContainer">
                        <p class="optionText">Seleccionar</p>
                    </div>
                    <div class="stateOptionContainer">
                        <div data-value="wantToRead" class="stateOption">Quiero leer</div>
                        <div data-value="read" class="stateOption">Leído</div>
                        <div data-value="reading" class="stateOption">Leyendo</div>
                    </div>
                </div>`;

    bookCardElement.innerHTML = innerHTML;
};

/* ----------------------------------------------------------------------------------------------------------------- */

/* buttonArea */
/* ----------------------------------------------------------------------------------------------------------------- */

const buttonAreaClickHandler = (e) => {
    const target = e.target;
    const currentTarget = e.currentTarget;
    const addButton = currentTarget.querySelector(".addButton");
    const filterButton = currentTarget.querySelector(".filterButton");
    const filterMenuElement = currentTarget.querySelector(".filterMenu");
    const addMenuWrapperElement = document.querySelector("#addMenuWrapper");
    const searchBarElement = currentTarget.querySelector(".searchBar");
    const searchDeleteIconElement = currentTarget.querySelector(".searchDeleteIcon");

    if (addButton.contains(target)) {
        e.stopImmediatePropagation();
        showBookEntryMenu(addMenuWrapperElement);
        return;
    }

    if (filterButton.contains(target)) {
        e.stopImmediatePropagation();
        if (filterMenuElement.classList.contains("show")) {
            hideAllMenuInterfaces();
        } else {
            showFilterMenu(filterMenuElement);
        }
        return;
    }

    if (searchDeleteIconElement.contains(target)) {
        searchBarElement.value = "";
        removeClass(searchDeleteIconElement, ["activated"]);
        searchBarElement.focus();
        return;
    }
};

const buttonAreaOnInputHandler = (e) => {
    const target = e.target;
    const currentTarget = e.currentTarget;
    const searchBarElement = currentTarget.querySelector(".searchBar");
    const searchDeleteIconElement = currentTarget.querySelector(".searchDeleteIcon");

    if (searchBarElement.contains(target)) {
        if (searchBarElement.value) {
            addClass(searchDeleteIconElement, ["activated"]);
        } else {
            removeClass(searchDeleteIconElement, ["activated"]);
        }
        setSearchQueryRestrictionObj(searchBarElement);
    }
};

const showFilterMenu = (filterMenuElement) => {
    const ancestorElementCSS = document.querySelector("header").contains(filterMenuElement) ? "header" : "footer";
    hideAllMenuInterfaces();
    updateAncestorZIndex(filterMenuElement, ancestorElementCSS, 100);
    addClass(filterMenuElement, ["show"]);
    hideMenuByOutsideClick(filterMenuElement, hideAllMenuInterfaces);
    filterMenuElement.addEventListener("click", filterMenuClickableOptionsHandler);
    loadFilterMenu(filterMenuElement);
};

const loadFilterMenu = (filterMenuElement) => {
    const AllCheckboxElement = filterMenuElement.querySelector(".filterAllContainer .filterCheckbox");
    const wantToReadCheckboxElement = filterMenuElement.querySelector(".filterWantToReadContainer .filterCheckbox");
    const readCheckboxElement = filterMenuElement.querySelector(".filterReadContainer .filterCheckbox");
    const readingCheckboxElement = filterMenuElement.querySelector(".filterReadingContainer .filterCheckbox");
    const type = "filter";
    const restrictionObj = user.currentSet.restrictionArr.find((obj) => {
        return obj.type === type;
    });
    let wantToReadValue;
    let readValue;
    let readingValue;

    if (restrictionObj) {
        wantToReadValue = restrictionObj.testArr.find((obj) => {
            return obj.filter === "wantToRead";
        }).value;
        readValue = restrictionObj.testArr.find((obj) => {
            return obj.filter === "read";
        }).value;
        readingValue = restrictionObj.testArr.find((obj) => {
            return obj.filter === "reading";
        }).value;

        AllCheckboxElement.checked = false;
        wantToReadCheckboxElement.checked = wantToReadValue;
        readCheckboxElement.checked = readValue;
        readingCheckboxElement.checked = readingValue;
    } else {
        [AllCheckboxElement, wantToReadCheckboxElement, readCheckboxElement, readingCheckboxElement].forEach(
            (filterCheckboxElement) => {
                filterCheckboxElement.checked = true;
            }
        );
    }
};

const filterMenuClickableOptionsHandler = (e) => {
    const target = e.target;
    const filterMenuElement = e.currentTarget;
    const filterAllCheckbox = filterMenuElement.querySelector(".filterAllContainer .filterCheckbox");
    const filterRegularCheckboxArr = Array.from(
        filterMenuElement.querySelectorAll(".filterContainer:not(.filterAllContainer) .filterCheckbox")
    );
    const filterCancelButton = filterMenuElement.querySelector(".cancelButton");
    const filterAcceptButton = filterMenuElement.querySelector(".acceptButton");

    if (filterAllCheckbox.contains(target)) {
        if (filterAllCheckbox.checked) {
            filterRegularCheckboxArr.forEach((checkbox) => {
                checkbox.checked = true;
            });
        }

        if (
            !filterAllCheckbox.checked &&
            filterRegularCheckboxArr.every((checkbox) => {
                return checkbox.checked;
            })
        ) {
            filterRegularCheckboxArr.forEach((checkbox) => {
                checkbox.checked = false;
            });
        }
        return;
    }

    if (
        filterRegularCheckboxArr.some((checkbox) => {
            return checkbox.contains(target);
        })
    ) {
        if (
            !filterAllCheckbox.checked &&
            filterRegularCheckboxArr.every((checkbox) => {
                return checkbox.checked;
            })
        ) {
            filterAllCheckbox.checked = true;
        }

        if (
            filterAllCheckbox.checked &&
            !filterRegularCheckboxArr.every((checkbox) => {
                return checkbox.checked;
            })
        ) {
            filterAllCheckbox.checked = false;
        }
        return;
    }

    if (filterCancelButton.contains(target)) {
        e.stopImmediatePropagation();
        hideAllMenuInterfaces();
        return;
    }

    if (filterAcceptButton.contains(target)) {
        setFilterRestrictionObj(filterMenuElement);
        hideAllMenuInterfaces();
        return;
    }
};

const getFilterRestrictionObj = (filterMenuElement) => {
    const type = "filter";
    const wantToRead = {
        filter: "wantToRead",
        value: filterMenuElement.querySelector(".filterWantToReadContainer .filterCheckbox").checked,
    };
    const read = {
        filter: "read",
        value: filterMenuElement.querySelector(".filterReadContainer .filterCheckbox").checked,
    };
    const reading = {
        filter: "reading",
        value: filterMenuElement.querySelector(".filterReadingContainer .filterCheckbox").checked,
    };

    return new Restriction(type, filterTestHandler, [wantToRead, read, reading]);
};

const setFilterRestrictionObj = (filterMenuElement) => {
    const type = "filter";
    const filterButtonArr = Array.from(document.querySelectorAll(".filterButton"));
    const destinationArr = user.currentSet.restrictionArr;
    const restrictionObj = getFilterRestrictionObj(filterMenuElement);
    const isAllChecked = restrictionObj.testArr.every((item) => {
        return item.value;
    });

    if (isAllChecked) {
        deleteRestriction(type, destinationArr);
        filterButtonArr.forEach((filterButton) => {
            removeClass(filterButton, ["on"]);
        });
    } else {
        setRestriction(restrictionObj, destinationArr);
        filterButtonArr.forEach((filterButton) => {
            addClass(filterButton, ["on"]);
        });
    }
};

const filterTestHandler = () => {};

const getSearchQueryRestrictionObj = (searchBarElement) => {
    const searchText = searchBarElement.value;
    const type = "searchQuery";

    return new Restriction(type, searchQueryTestHandler, [{ searchQuery: searchText }]);
};

const setSearchQueryRestrictionObj = (searchBarElement) => {
    const type = "searchQuery";
    const destinationArr = user.currentSet.restrictionArr;
    const restrictionObj = getSearchQueryRestrictionObj(searchBarElement);
    const isNotEmpty = restrictionObj.testArr[0].searchQuery.length;

    if (isNotEmpty) {
        setRestriction(restrictionObj, destinationArr);
    } else {
        deleteRestriction(type, destinationArr);
    }
};

const searchQueryTestHandler = () => {};

/* ----------------------------------------------------------------------------------------------------------------- */

/* indicator */
/* ----------------------------------------------------------------------------------------------------------------- */

const updateIndicator = () => {
    const wantToReadContainerValueTextElement = document.querySelector(".wantToReadContainer .valueText");
    const readingContainerValueTextElement = document.querySelector(".readingContainer .valueText");
    const readContainerValueTextElement = document.querySelector(".readContainer .valueText");
    const wantToReadValueText = Array.from(
        document.querySelectorAll(`main .bookStateDropdownContainer[data-value="wantToRead"]`)
    ).length;
    const readingValueText = Array.from(
        document.querySelectorAll(`main .bookStateDropdownContainer[data-value="reading"]`)
    ).length;
    const readValueText = Array.from(
        document.querySelectorAll(`main .bookStateDropdownContainer[data-value="read"]`)
    ).length;

    wantToReadContainerValueTextElement.innerText = wantToReadValueText;
    readingContainerValueTextElement.innerText = readingValueText;
    readContainerValueTextElement.innerText = readValueText;
};

/* ----------------------------------------------------------------------------------------------------------------- */

/* Utilidades */
/* ----------------------------------------------------------------------------------------------------------------- */

const printAllEventListener = () => {
    let elementArr = Array.from(document.querySelectorAll("body, body *"));

    return elementArr.reduce((result, element) => {
        if (Object.keys(getEventListeners(element)).length > 0) {
            result.push({ eventListeners: getEventListeners(element), element: element });
        }

        return result;
    }, []);
};

/* ----------------------------------------------------------------------------------------------------------------- */

/* Inicio en carga inicial de la página */
/* ----------------------------------------------------------------------------------------------------------------- */

buttonAreaArr.forEach((item) => {
    item.addEventListener("click", buttonAreaClickHandler);
    item.addEventListener("input", buttonAreaOnInputHandler);
});

main.addEventListener("click", mainClickHandler);

updateIndicator();

/* ----------------------------------------------------------------------------------------------------------------- */
