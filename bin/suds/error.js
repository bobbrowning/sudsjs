"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* ****************************************
*
*  Validate the config file
*
**************************************** */
const trace = require('track-n-trace');
const suds = require('../../config/suds');
const lang = require('../../config/language').EN;
module.exports = async function (msg) {
    let viewData = {};
    let time = new Date().getTime();
    let stack = new Error();
    console.log(`Error: ${time} ***** ${msg} *******`);
    viewData.output = `<h1>Ooops! - there has been a problem</h1>
  <H2>${msg}</h2>
  <p>${stack}</p>`;
    viewData.footnote = lang.footnoteText;
    viewData.heading = lang.homeHeading;
    throw viewData;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL3N1ZHMvZXJyb3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OzsyQ0FJMkM7QUFDM0MsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO0FBQ3RDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBO0FBQ3pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQTtBQUloRCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVyxHQUFHO0lBQ2xDLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQTtJQUNqQixJQUFJLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQy9CLElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUE7SUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksVUFBVSxHQUFHLFVBQVUsQ0FBQyxDQUFBO0lBQ2xELFFBQVEsQ0FBQyxNQUFNLEdBQUc7UUFDWixHQUFHO09BQ0osS0FBSyxNQUFNLENBQUE7SUFDaEIsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFBO0lBQ3JDLFFBQVEsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQTtJQUNuQyxNQUFNLFFBQVEsQ0FBQTtBQUNoQixDQUFDLENBQUEifQ==