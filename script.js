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

