"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const suds = require('../../config/suds');
const db = require('./db');
const globalTags = require('../../local/global-header-tags');
const format = require('date-format');
module.exports = async function (res, view, output) {
    trace.log('sending output', typeof output);
    trace.log({ output, level: 'verbose' });
    let viewData = {};
    if (typeof output === 'string' && output) {
        viewData.output = output;
        viewData.footnote = '';
        viewData.headerTags = suds.headerTags + globalTags;
        viewData.pageHeaderTags = suds.pageHeaderTags + globalTags;
        viewData.heading = '';
    }
    else {
        viewData = output;
        let headerTags = suds.headerTags;
        if (output.headerTags) {
            headerTags += output.headerTags;
        }
        viewData.headerTags = headerTags + globalTags;
        viewData.pageHeaderTags = suds.pageHeaderTags + globalTags;
    }
    let dateStamp = new Date().toLocaleString();
    viewData.footnote += '&nbsp;' + dateStamp;
    viewData.footnote = viewData.footnote.replace('{{version}}', suds.versionHistory[suds.versionHistory.length - 1].version);
    if (!viewData.headerTags) {
        viewData.headerTags = '<!-- space for program generated header tags -->';
    }
    if (!viewData.pageHeaderTags) {
        viewData.pageHeaderTags = '<!-- space for program generated header tags -->';
    }
    res.render(view, viewData);
    return ('OK');
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZC12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9zdWRzL3NlbmQtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN0QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUN6QyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDMUIsTUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLENBQUE7QUFDNUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFBO0FBRXJDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxXQUFXLEdBQUcsRUFBRSxJQUFJLEVBQUUsTUFBTTtJQUNoRCxLQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLE9BQU8sTUFBTSxDQUFDLENBQUE7SUFDMUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQTtJQUN2QyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUE7SUFDakIsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksTUFBTSxFQUFFO1FBQ3hDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1FBQ3hCLFFBQVEsQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFBO1FBQ3RCLFFBQVEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUE7UUFDbEQsUUFBUSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQTtRQUMxRCxRQUFRLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQTtLQUN0QjtTQUFNO1FBQ0wsUUFBUSxHQUFHLE1BQU0sQ0FBQTtRQUNqQixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFBO1FBQ2hDLElBQUksTUFBTSxDQUFDLFVBQVUsRUFBRTtZQUFFLFVBQVUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFBO1NBQUU7UUFDMUQsUUFBUSxDQUFDLFVBQVUsR0FBRyxVQUFVLEdBQUcsVUFBVSxDQUFBO1FBQzdDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUE7S0FDM0Q7SUFDRCxJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFBO0lBQzNDLFFBQVEsQ0FBQyxRQUFRLElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQTtJQUN6QyxRQUFRLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3pILElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFO1FBQUUsUUFBUSxDQUFDLFVBQVUsR0FBRyxrREFBa0QsQ0FBQTtLQUFFO0lBQ3RHLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFO1FBQUUsUUFBUSxDQUFDLGNBQWMsR0FBRyxrREFBa0QsQ0FBQTtLQUFFO0lBQzlHLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUNmLENBQUMsQ0FBQSJ9