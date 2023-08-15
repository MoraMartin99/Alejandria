/* Variables globales */
/* ----------------------------------------------------------------------------------------------------------------- */
const body = document.querySelector("body");
const main = document.querySelector("main");
const filterButtonWrapperArr = Array.from(document.querySelectorAll(".filterButtonWrapper"));
const menuWrapperArr = Array.from(document.querySelectorAll(".menuWrapper"));
const buttonAreaArr = Array.from(document.querySelectorAll(".buttonArea"));
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

