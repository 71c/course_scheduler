// LOL I don't need this anymore because I found a better way of getting da data


var textFile = null;
var makeTextFile = function(text) {
    var data = new Blob([text], { type: 'text/plain' });

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
};

var downloadFile = function(textFile, fileName) {
    e = document.createElement("a");
    e.href = textFile;
    e.download = fileName;
    document.body.prepend(e);
    e.click();
    e.remove();
}

var saveJson = function(object, fileName) {
    keylogsJsonString = JSON.stringify(object, null, 2);
    textFile = makeTextFile(keylogsJsonString);
    downloadFile(textFile, fileName);
}



// function getClassesJson() {
// 	NodeList.prototype.map = Array.prototype.map
// 	HTMLCollection.prototype.map = Array.prototype.map
// 	return document.querySelectorAll('.tfp_accordion_row').map(e => ({
// 		name: e.children[0].children[1].innerText,
// 		number: e.children[0].childNodes[2].nodeValue.trim(),
// 		description: e.children[1].innerText.trim(),
// 		requiredSelectionText: e.children[2].children[0].children[0].innerText,
// 		blocks: e.children[2].children[1].children.map(tableContainer => ({
// 			sectionsType: tableContainer.firstElementChild.children[1].textContent.trim(),
// 			// sections: tableContainer.firstElementChild.children[3].children.map(function(section) {
// 			sections: tableContainer.firstElementChild.children[3].getElementsByClassName('accorion-head').map(function(section) {
// 				var dayTimeLocation = section.children[3].firstElementChild.children[0];
// 				var timesAndCampus = dayTimeLocation.children.map(e=>e.textContent);
// 				var times = timesAndCampus.slice(0, -1);
// 				var campus = timesAndCampus.slice(-1)[0];
// 				var location = Array.prototype.slice.call(dayTimeLocation.childNodes,1,-1).filter(e=>e.nodeName=="#text")[0].nodeValue.trim();
// 				return {
// 					sectionName: section.children[0].childNodes[0].nodeValue.trim(),
// 					classNumber: section.children[1].textContent,
// 					session: section.children[2].textContent,
// 					times: times,
// 					campus: campus,
// 					location: location,
// 					faculty: section.children[3].firstElementChild.children[1].innerText.trim(),
// 					credit: section.children[4].textContent,
// 					status: section.children[5].firstElementChild.alt.split(' ')[0]
// 				};
// 			})
// 		}))
// 	}))
// }

function getClassesJson() {
	NodeList.prototype.map = Array.prototype.map
	HTMLCollection.prototype.map = Array.prototype.map
	return document.querySelectorAll('.tfp_accordion_row').map(e => ({
		name: e.children[0].children[1].innerText,
		number: e.children[0].childNodes[2].nodeValue.trim(),
		description: e.children[1].innerText.trim(),
		requiredSelectionText: e.children[2].children[0].children[0].innerText,
		blocks: e.children[2].children[1].children.map(tableContainer => ({
			sectionsType: tableContainer.firstElementChild.children[1].textContent.trim(),
			// sections: tableContainer.firstElementChild.children[3].children.map(function(section) {
			sections: tableContainer.firstElementChild.children[3].getElementsByClassName('accorion-head').map(function(section) {
				var timeLocationFacultys = section.children[3].children.map(function(meetingElem) {
					var dayTimeLocation = meetingElem.children[0];
					var timesAndCampus = dayTimeLocation.children.map(e=>e.textContent);
					return {
						times: timesAndCampus.slice(0, -1),
						campus: timesAndCampus.slice(-1)[0],
						location: Array.prototype.slice.call(dayTimeLocation.childNodes,1,-1).filter(e=>e.nodeName=="#text")[0].nodeValue.trim(),
						faculty: meetingElem.children[1].innerText.trim()
					};
				});
				return {
					sectionName: section.children[0].childNodes[0].nodeValue.trim(),
					classNumber: section.children[1].textContent,
					session: section.children[2].textContent,
					timeLocationFacultys: timeLocationFacultys,
					credit: section.children[4].textContent,
					status: section.children[5].firstElementChild.alt.split(' ')[0]
				};
			})
		}))
	}))
}

classes = getClassesJson();
saveJson(classes, "classes.json");



// https://www.youtube.com/watch?v=PMhla3ks6FI

