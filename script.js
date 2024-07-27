document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('language-select').addEventListener('change', function () {
        loadLanguage(this.value);
    });
    loadLanguage('en');
});

async function loadLanguage(lang) {
    try {
        const response = await fetch(`${lang}.json`);
        const translations = await response.json();

        document.getElementById('header-title').textContent = translations.headerTitle;
        document.getElementById('sub-header').innerHTML = translations.subHeader;
        document.getElementById('step1-title').textContent = translations.step1Title;
        document.getElementById('step2-title').textContent = translations.step2Title;

        document.getElementById('title-label').textContent = translations.titleLabel;
        document.getElementById('title').placeholder = translations.titlePlaceholder;
        document.getElementById('title-help').textContent = translations.titleHelp;

        document.getElementById('url-label').textContent = translations.urlLabel;
        document.getElementById('url').placeholder = translations.urlPlaceholder;
        document.getElementById('url-help').textContent = translations.urlHelp;

        document.getElementById('content-label').textContent = translations.contentLabel;
        document.getElementById('content').placeholder = translations.contentPlaceholder;
        document.getElementById('content-help').textContent = translations.contentHelp;

        document.getElementById('word-count').textContent = translations.wordCountLabel + ": 0";
        document.getElementById('char-count').textContent = translations.charCountLabel + ": 0";
        document.getElementById('reading-time').textContent = translations.readingTimeLabel + ": 0 minutes";

        document.getElementById('generated-text-label').textContent = translations.generatedTextLabel;
        document.getElementById('generated-text-help').textContent = translations.generatedTextHelp;
        document.getElementById('copy-text-button').textContent = translations.copyTextButton;

        document.getElementById('links-label').textContent = translations.linksLabel;
        document.getElementById('google-label').textContent = "Google:";
        document.getElementById('ical-label').textContent = "iCal:";
        document.getElementById('outlook-label').textContent = "Outlook:";
        document.getElementById('copy-google-link').textContent = translations.copyButton;
        document.getElementById('copy-ical-link').textContent = translations.copyButton;
        document.getElementById('copy-outlook-link').textContent = translations.copyButton;
        document.getElementById('preview-label').textContent = translations.previewLabel;

        updatePreviewAndLink(translations);
    } catch (error) {
        console.error('Error loading language file:', error);
    }
}

function updatePreviewAndLink(translations) {
    const titleInput = document.getElementById('title').value;
    const title = titleInput ? `${translations.previewTitleReading}: "${titleInput}"` : translations.previewTitleDefault;
    const url = document.getElementById('url').value;
    const content = document.getElementById('content').value;

    // Calculate reading time
    const wordCount = content.split(/\s+/).filter(word => word).length;
    const charCount = content.length;
    let readingTimeMinutes = Math.floor(wordCount / 200);
    let readingTimeSeconds = Math.ceil((wordCount % 200) / 200 * 60);
    const totalReadingTime = readingTimeMinutes * 60 + readingTimeSeconds;

    // Ensure minimum reading time is 1 sec if there is content
    if (content) {
        readingTimeMinutes = Math.max(readingTimeMinutes, 0);
        readingTimeSeconds = Math.max(readingTimeSeconds, 1);
    }

    // Update counts and reading time display
    document.getElementById('word-count').innerHTML = `${translations.wordCountLabel}: ${wordCount}`;
    document.getElementById('char-count').innerHTML = `${translations.charCountLabel}: ${charCount}`;
    document.getElementById('reading-time').innerHTML = content ?
        `${translations.readingTimeLabel}: ${readingTimeMinutes} minutes ${readingTimeSeconds} seconds` :
        `${translations.readingTimeLabel}: 0 minutes`;

    // Generate event title and description
    const eventTitle = titleInput ? `${translations.previewTitleReading}: "${titleInput}"` : translations.previewTitleDefault;
    const eventDescription = url ?
        `${translations.previewDescriptionWithLink}: ${url}. ${translations.previewReadingTime}: ${readingTimeMinutes} minutes ${readingTimeSeconds} seconds.` :
        `${translations.previewReadingTime}: ${readingTimeMinutes} minutes ${readingTimeSeconds} seconds.`;

    // Get current date and time
    const now = new Date();
    const startDateTime = new Date(now.getTime() + 5 * 60000); // Schedule 5 minutes from now
    const endDateTime = new Date(startDateTime.getTime() + totalReadingTime * 1000);

    const formattedDate = startDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const formattedStartTime = startDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
    const formattedEndTime = endDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Update preview
    const previewHTML = `
        <div class="event-title">
            <span class="material-icons">event</span> 
            ${eventTitle} ${content ? `[${readingTimeMinutes} min]` : ''}
        </div>
        <div class="event-date-time">${formattedDate} • ${formattedStartTime} - ${formattedEndTime}</div>
        <div class="event-section">
            <span class="material-icons">description</span>
            <span>
                ${translations.previewBookedTime} ${titleInput ? `${translations.previewTitleReading.toLowerCase()} "${titleInput}"` : translations.previewTitleDefault.toLowerCase()}.
            </span>
        </div>
        ${url ? `
        <div class="event-section">
            <span class="material-icons">link</span>
            <span>${translations.previewReadHere}: <a href="${url}" target="_blank">${url}</a></span>
        </div>
        ` : ''}
        ${content ? `
        <div class="event-section">
            <span class="material-icons">schedule</span>
            <span>${translations.previewReadingTime}: ${readingTimeMinutes} minutes ${readingTimeSeconds} seconds.</span>
        </div>
        ` : ''}
    `;
    document.getElementById('preview').innerHTML = previewHTML;

    // Generate Google Calendar link
    const gcalLink = generateGoogleCalendarLink(eventTitle, eventDescription, startDateTime, endDateTime);
    const icsLink = generateIcsLink(eventTitle, eventDescription, startDateTime, endDateTime);
    const outlookLink = generateOutlookLink(eventTitle, eventDescription, startDateTime, endDateTime);

    // Set link values
    document.getElementById('google-calendar-link').value = gcalLink;
    document.getElementById('ical-calendar-link').value = icsLink;
    document.getElementById('outlook-calendar-link').value = outlookLink;

    // Generate text for Substack
    const generatedText = content ?
        `🔔 ${translations.generatedTextWithContent} <span style="font-weight: bold;">${readingTimeMinutes} min ${readingTimeSeconds} sec.</span> ${translations.generatedTextReadLater}: 
            <a href="${gcalLink}" target="_blank">${translations.addToGoogleCalendar}</a> | 
            <a href="${icsLink}" target="_blank">${translations.addToICal}</a> | 
            <a href="${outlookLink}" target="_blank">${translations.addToOutlook}</a>` :
        `🔔 ${translations.generatedTextNoContent} 
            <a href="${gcalLink}" target="_blank">${translations.addToGoogleCalendar}</a> | 
            <a href="${icsLink}" target="_blank">${translations.addToICal}</a> | 
            <a href="${outlookLink}" target="_blank">${translations.addToOutlook}</a>`;

    document.getElementById('generated-text').innerHTML = generatedText;

    // Copy to clipboard functionality
    document.getElementById('copy-google-link').onclick = function () {
        navigator.clipboard.writeText(gcalLink).then(() => {
            alert(translations.googleLinkCopied);
        });
    };

    document.getElementById('copy-ical-link').onclick = function () {
        navigator.clipboard.writeText(icsLink).then(() => {
            alert(translations.icalLinkCopied);
        });
    };

    document.getElementById('copy-outlook-link').onclick = function () {
        navigator.clipboard.writeText(outlookLink).then(() => {
            alert(translations.outlookLinkCopied);
        });
    };

    document.getElementById('copy-text-button').onclick = function () {
        const generatedTextHtml = document.getElementById('generated-text').innerHTML;
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = generatedTextHtml.replace(/<[^>]*>/g, ''); // Remove HTML tags
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        alert(translations.generatedTextCopied);
    };
}

function generateGoogleCalendarLink(title, description, startDateTime, endDateTime) {
    const formattedStart = formatDateTime(startDateTime);
    const formattedEnd = formatDateTime(endDateTime);

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formattedStart}/${formattedEnd}&details=${encodeURIComponent(description)}`;
}

function generateIcsLink(title, description, startDateTime, endDateTime) {
    const formattedStart = formatDateTime(startDateTime);
    const formattedEnd = formatDateTime(endDateTime);

    return `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${encodeURIComponent(title)}
DESCRIPTION:${encodeURIComponent(description)}
DTSTART:${formattedStart}
DTEND:${formattedEnd}
END:VEVENT
END:VCALENDAR`;
}

function generateOutlookLink(title, description, startDateTime, endDateTime) {
    const formattedStart = formatDateTime(startDateTime);
    const formattedEnd = formatDateTime(endDateTime);

    return `https://outlook.office.com/owa/?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description)}&startdt=${formattedStart}&enddt=${formattedEnd}`;
}

function formatDateTime(date) {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('link-generator-form').addEventListener('input', function () {
        loadLanguage(document.getElementById('language-select').value);
    });
});
