import { Meteor } from 'meteor/meteor';

import { InfoItemsMailHandler } from './InfoItemsMailHandler';
import { GlobalSettings } from '../config/GlobalSettings';
import { Attachment } from '../attachment';

export class SendAgendaMailHandler extends InfoItemsMailHandler {

    constructor(sender, minute) {
        super(sender
            , minute.getPersonsInformedWithEmail(Meteor.users)
            , minute, minute.getOpenTopicsWithoutItems()
            , minute.parentMeetingSeries()
            , minute.getParticipants(Meteor.users)
            , minute.getInformed(Meteor.users)
            , 'sendAgenda');
    }
    
    _sendMail() {
        super._sendMail(this._getEmailData());
    }    

    _getSubject() {
        return this._getSubjectPrefix() + ' (Agenda)';
    }


    _getEmailData() {
        let attachments = Attachment.findForMinutes(this._minute._id).fetch();
        attachments.forEach((file) => {
            let usr = Meteor.users.findOne(file.userId);
            return file.username = usr.username;
        });
        
        let unSkippedTopics = this._topics.filter(topic => !topic.isSkipped);
        return {
            minutesDate: this._minute.date,
            minutesGlobalNote: this._minute.globalNote,
            meetingSeriesName: this._meetingSeries.name,
            meetingSeriesProject: this._meetingSeries.project,
            meetingSeriesURL: GlobalSettings.getRootUrl('meetingseries/' + this._meetingSeries._id),
            minuteUrl: GlobalSettings.getRootUrl('minutesedit/' + this._minute._id),
            participants: this._userArrayToString(this._participants),
            participantsAdditional: this._minute.participantsAdditional,
            topics: unSkippedTopics,
            attachments: attachments
        };
    }

    getCountRecipients() {
        return this._recipients.length;
    }

}