"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const trace = require('track-n-trace');
const suds = require('../../config/suds');
const globalTags = require('../../local/global-header-tags');
module.exports = async function (res, view, output) {
    trace.log('sending output', typeof output);
    trace.log({ output, level: 'verbose' });
    let viewData = { output: '' };
    if (output) {
        if (typeof output === 'string') {
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
    }
    let dateStamp = new Date().toLocaleString();
    viewData.footnote += '&nbsp;' + dateStamp;
    viewData.footnote = viewData.footnote?.replace('{{version}}', suds.versionHistory[suds.versionHistory.length - 1].version);
    if (!viewData.headerTags) {
        viewData.headerTags = '<!-- space for program generated header tags -->';
    }
    if (!viewData.pageHeaderTags) {
        viewData.pageHeaderTags = '<!-- space for program generated header tags -->';
    }
    res.render(view, viewData);
    return ('OK');
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VuZC12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2Jpbi9zdWRzL3NlbmQtdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQTtBQUN0QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtBQUN6QyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQTtBQUc1RCxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVyxHQUFhLEVBQUcsSUFBWSxFQUFFLE1BQXlCO0lBQ3RGLEtBQUssQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsT0FBTyxNQUFNLENBQUMsQ0FBQTtJQUMxQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQ3ZDLElBQUksUUFBUSxHQUFhLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFBO0lBQ3ZDLElBQUksTUFBTSxFQUFFO1FBQ1YsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7WUFDOUIsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7WUFDeEIsUUFBUSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7WUFDdEIsUUFBUSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQTtZQUNsRCxRQUFRLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFBO1lBQzFELFFBQVEsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFBO1NBQ3RCO2FBQU07WUFDTCxRQUFRLEdBQUcsTUFBTSxDQUFBO1lBQ2pCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUE7WUFDaEMsSUFBSSxNQUFNLENBQUMsVUFBVSxFQUFFO2dCQUFFLFVBQVUsSUFBSSxNQUFNLENBQUMsVUFBVSxDQUFBO2FBQUU7WUFDMUQsUUFBUSxDQUFDLFVBQVUsR0FBRyxVQUFVLEdBQUcsVUFBVSxDQUFBO1lBQzdDLFFBQVEsQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUE7U0FDM0Q7S0FDRjtJQUNELElBQUksU0FBUyxHQUFXLElBQUksSUFBSSxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUE7SUFDbkQsUUFBUSxDQUFDLFFBQVEsSUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFBO0lBQ3pDLFFBQVEsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDMUgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUU7UUFBRSxRQUFRLENBQUMsVUFBVSxHQUFHLGtEQUFrRCxDQUFBO0tBQUU7SUFDdEcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUU7UUFBRSxRQUFRLENBQUMsY0FBYyxHQUFHLGtEQUFrRCxDQUFBO0tBQUU7SUFDOUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDMUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQ2YsQ0FBQyxDQUFBIn0=