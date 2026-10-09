import { Chat, Message, ExtractedItem, Summary } from '../types';

// Helper to calculate relative ISO dates and student-friendly strings
export function getRelativeDateInfo(daysFromNow: number, hours = 23, minutes = 59) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hours, minutes, 0, 0);

  const iso = d.toISOString();
  const dateStr = d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return { iso, dateStr, timeStr };
}

export function generateDemoData(): {
  chats: Chat[];
  messages: Message[];
  items: ExtractedItem[];
  summaries: Summary[];
} {
  const now = new Date();
  const tomorrow = getRelativeDateInfo(1, 14, 0); // Tomorrow 2:00 PM
  const tomorrowNight = getRelativeDateInfo(1, 23, 59); // Tomorrow 11:59 PM
  const in3Days = getRelativeDateInfo(3, 17, 0); // In 3 days 5:00 PM
  const thisThursday = getRelativeDateInfo(2, 11, 0); // In 2 days (Thursday) 11:00 AM
  const thisFriday = getRelativeDateInfo(4, 23, 59); // This Friday 11:59 PM
  const in5Days = getRelativeDateInfo(5, 10, 0); // In 5 days 10:00 AM
  const in7Days = getRelativeDateInfo(7, 23, 59); // In 7 days

  // Chat 1: CSE-4 Class Group
  const chat1Id = 'chat-demo-cse4';
  const chat1: Chat = {
    id: chat1Id,
    name: 'CSE-4 Class Group',
    source: 'demo',
    lastImportedAt: now.toISOString(),
    processedMessageHashes: [],
  };

  // Chat 2: Project Team
  const chat2Id = 'chat-demo-project';
  const chat2: Chat = {
    id: chat2Id,
    name: 'Project Team',
    source: 'demo',
    lastImportedAt: now.toISOString(),
    processedMessageHashes: [],
  };

  // 60 Messages for CSE-4 Class Group
  const cseRawMessages = [
    { sender: 'Aarav Patel', text: 'Good morning guys, anyone reached 3rd floor yet?' },
    { sender: 'Rohan Sharma', text: 'Yeah sitting in room 302, AC is not working though 😭' },
    { sender: 'Neha Gupta', text: 'Did sir take attendance in the 9 AM lecture?' },
    { sender: 'Rohan Sharma', text: 'Yes, he took it right at 9:02 AM sharp lol' },
    { sender: 'Vikas Rao', text: 'RIP whoever woke up 5 mins late today' },
    { sender: 'Karan Mehra', text: '+1 lol' },
    { sender: 'Ananya Roy', text: 'Can someone send yesterday’s Computer Networks slides please?' },
    { sender: 'Aarav Patel', text: 'Sending in 2 mins, checking my drive' },
    { sender: 'Ananya Roy', text: 'Thanks!' },
    { sender: 'Aarav Patel', text: 'Shared the link on drive 👍' },
    { sender: 'Pooja Nair', text: 'Is canteen serving hot samosas right now?' },
    {
      sender: 'CR Rahul',
      text: `📢 @everyone Official Notice: Dean announced College Holiday this Monday (${getRelativeDateInfo(3).dateStr}) on account of the State Youth Festival. No lectures or lab sessions will be conducted!`,
      isNotice: true,
      title: 'College Holiday on Monday (Youth Festival)',
      details: 'Dean announced campus holiday for the State Youth Festival. No lectures or lab sessions will be held.',
      deadline: getRelativeDateInfo(3).iso,
      priority: 'medium' as const,
    },
    { sender: 'Varun Joshi', text: 'LETS GOOO long weekend!! 🎉' },
    { sender: 'Sneha Kulkarni', text: 'Finally some sleep 😴' },
    { sender: 'Karan Mehra', text: 'Bro we have assignments due anyway haha' },
    { sender: 'Tanvi Shah', text: 'Don’t remind us Karan 💀' },
    { sender: 'Aditya Verma', text: 'Who is free for canteen tea after this lecture?' },
    { sender: 'Vikas Rao', text: 'Me and Rohan are coming' },
    { sender: 'Rohan Sharma', text: 'Count me in' },
    { sender: 'Pooja Nair', text: 'Same' },
    { sender: 'Riya Sen', text: 'Guys did anyone solve question 4 from DBMS tutorial?' },
    { sender: 'Aarav Patel', text: 'The BCNF decomposition one? It took me 2 hours' },
    { sender: 'Riya Sen', text: 'It was super confusing' },
    {
      sender: 'Prof. Sharma (DBMS)',
      text: `Reminder to all CSE-4 students: DBMS Assignment 3 (Normalization up to BCNF) is live on the student portal. The hard deadline is this Friday (${thisFriday.dateStr}) at 11:59 PM. Late submissions will receive 0 marks.`,
      isAssignment: true,
      title: 'DBMS Assignment 3 (BCNF & 3NF)',
      details: 'Solve problem set on BCNF decomposition and upload PDF solution to the student portal. Zero tolerance for late submission.',
      deadline: thisFriday.iso,
      priority: 'high' as const,
    },
    { sender: 'Sneha Kulkarni', text: 'Noted sir, thank you.' },
    { sender: 'Karan Mehra', text: 'Thanks sir.' },
    { sender: 'Rohan Sharma', text: 'Ok sir.' },
    { sender: 'Aarav Patel', text: 'See I told you it was due this Friday 😭' },
    { sender: 'Varun Joshi', text: 'Time to grind SQL queries all night' },
    { sender: 'Neha Gupta', text: 'Anyone has the textbook PDF?' },
    { sender: 'Vikas Rao', text: 'Uploaded in the group files section' },
    {
      sender: 'Exam Cell Coordinator',
      text: `IMPORTANT NOTICE: Computer Networks Mid-Term Examination is officially scheduled in 5 days (${in5Days.dateStr} at ${in5Days.timeStr}). Seating arrangements will be pasted on the departmental notice board by 9:00 AM.`,
      isDate: true,
      title: 'Computer Networks Mid-Term Exam',
      details: 'Department exam in Room 301-305. Bring College ID card and scientific calculator. Starts at 10:00 AM.',
      deadline: in5Days.iso,
      priority: 'high' as const,
    },
    { sender: 'Ananya Roy', text: 'Wait midterms are in 5 days already?? 😱' },
    { sender: 'Pooja Nair', text: 'Time flies so fast this semester' },
    { sender: 'Tanvi Shah', text: 'How many units are coming for CN?' },
    { sender: 'CR Rahul', text: 'Units 1, 2, and 3 up to Data Link Layer' },
    { sender: 'Rohan Sharma', text: 'Thanks Rahul' },
    { sender: 'Aditya Verma', text: 'Ok thanks' },
    { sender: 'Varun Joshi', text: 'Done' },
    {
      sender: 'Lab Incharge Dr. Mehta',
      text: `ATTENTION CSE-4: OS Lab Record submission hard deadline is tomorrow (${tomorrow.dateStr}) at 2:00 PM in Lab 304. Hard copy with signed outputs and index is mandatory. External viva marks depend on this.`,
      isAssignment: true,
      title: 'OS Lab Record Hard-Copy Submission',
      details: 'Submit complete signed lab record book with printouts of shell scripts and CPU scheduling algorithms to Lab 304 by 2:00 PM.',
      deadline: tomorrow.iso,
      priority: 'high' as const,
    },
    { sender: 'Karan Mehra', text: 'Bro does anyone have printouts ready?!' },
    { sender: 'Sneha Kulkarni', text: 'Print shop near gate 2 has a huge line right now' },
    { sender: 'Aarav Patel', text: 'I am in the line right now, 15 people ahead of me' },
    { sender: 'Rohan Sharma', text: 'Can you print 1 copy for me too bro? Will GPay you' },
    { sender: 'Aarav Patel', text: 'Sure send the PDF on Telegram' },
    { sender: 'Rohan Sharma', text: 'Sent! You are a lifesaver 🙏' },
    { sender: 'Tanvi Shah', text: 'Is black pen mandatory for diagram borders?' },
    {
      sender: 'HOD Office Notice',
      text: `Department Announcement: Mandatory Guest Lecture on 'Scalable Cloud Architectures' by Senior Principal Engineer at Google is scheduled for this Thursday (${thisThursday.dateStr}) at 11:00 AM in Mechanical Seminar Hall. Attendance is compulsory.`,
      isNotice: true,
      title: 'Guest Lecture: Scalable Cloud by Google Engineer',
      details: 'Mechanical Seminar Hall at 11:00 AM. Topic covers microservices, Kubernetes, and distributed storage.',
      deadline: thisThursday.iso,
      priority: 'medium' as const,
    },
    { sender: 'Pooja Nair', text: 'Google engineer! That sounds actually interesting' },
    { sender: 'Vikas Rao', text: 'Yeah definitely attending this one' },
    { sender: 'Varun Joshi', text: 'Are certificates provided for this?' },
    { sender: 'CR Rahul', text: 'Yes, digital certificate for all attendees who scan the QR code' },
    { sender: 'Neha Gupta', text: 'Nice 👍' },
    { sender: 'Ananya Roy', text: 'Great thanks' },
    {
      sender: 'Accounts & Academic Cell',
      text: `Final Reminder: Last date for Semester Exam Fee Payment without fine is in 7 days (${in7Days.dateStr} at 11:59 PM). Students failing to pay will have hall tickets withheld. Pay via ERP portal.`,
      isNotice: true,
      title: 'Semester Exam Fee Payment (No Fine Deadline)',
      details: 'Pay via college ERP portal online before the cutoff date to avoid a late fine of $25 and hold on exam hall tickets.',
      deadline: in7Days.iso,
      priority: 'high' as const,
    },
    { sender: 'Rohan Sharma', text: 'Paid mine yesterday through UPI, receipt generated instantly' },
    { sender: 'Aditya Verma', text: 'Receipt downloaded 👍' },
    { sender: 'Sneha Kulkarni', text: 'Thanks for the reminder' },
    { sender: 'Karan Mehra', text: 'Ok done' },
    { sender: 'Aarav Patel', text: 'See everyone in the library at 5 PM for OS lab prep' },
    { sender: 'Rohan Sharma', text: 'See ya' },
  ];

  // 30 Messages for Project Team
  const projectRawMessages = [
    { sender: 'Alex Rivera (You)', text: 'Hey team, let’s sync up on our Hackathon prototype status!' },
    { sender: 'Maya Lin', text: 'Hey! I finished the responsive UI mockup for the chat stream' },
    { sender: 'Lucas Miller', text: 'Awesome Maya. The backend parsing logic and store are almost ready' },
    {
      sender: 'Hackathon Lead Maya',
      text: `Friendly alert team: The Hackathon Idea Abstract & Architecture Submission closes tomorrow (${tomorrowNight.dateStr} at 11:59 PM) on Devpost. We must submit the 500-word writeup!`,
      isAssignment: true,
      title: 'Hackathon Idea Abstract Submission (Devpost)',
      details: 'Submit 500-word project overview, problem statement, and system architecture diagram on Devpost.',
      deadline: tomorrowNight.iso,
      priority: 'high' as const,
    },
    { sender: 'Lucas Miller', text: 'I can draft the backend architecture section tonight' },
    { sender: 'Alex Rivera (You)', text: 'I will write the problem statement and student chat hub workflow' },
    { sender: 'Elena Rostova', text: 'I will review and submit before 9 PM tomorrow so we don’t rush' },
    { sender: 'Maya Lin', text: 'Perfect plan' },
    { sender: 'Lucas Miller', text: 'Pushed the deduplication rule helper to the git branch' },
    { sender: 'Alex Rivera (You)', text: 'Checking the PR right now' },
    { sender: 'Maya Lin', text: 'Tests look all green ✅' },
    { sender: 'Lucas Miller', text: 'Nice!' },
    {
      sender: 'Elena Rostova',
      text: `Quick schedule update: Moving our sprint sync meeting today from 5:00 PM to 7:30 PM on Google Meet because my lab session got extended.`,
      isDate: true,
      title: 'Project Sprint Sync Meeting (Google Meet)',
      details: 'Moved to 7:30 PM. Agenda: Review abstract draft, test live deduplication, and assign PPT slides.',
      deadline: getRelativeDateInfo(0, 19, 30).iso,
      priority: 'medium' as const,
    },
    { sender: 'Alex Rivera (You)', text: '7:30 PM works great for me' },
    { sender: 'Lucas Miller', text: 'Works for me too' },
    { sender: 'Maya Lin', text: 'See you all on Meet at 7:30' },
    { sender: 'Elena Rostova', text: 'Here is the link: meet.google.com/syn-cpul-hub' },
    { sender: 'Lucas Miller', text: 'Saved' },
    {
      sender: 'Faculty Mentor Dr. Kapoor',
      text: `Project Teams: Final Project Progress PPT submission is due in 3 days (${in3Days.dateStr} at 5:00 PM). Include 8 slides covering architecture, UI wireframes, test cases, and timeline.`,
      isAssignment: true,
      title: 'Project Progress PPT Submission (Dr. Kapoor)',
      details: '8-slide presentation submitted in PDF format covering architecture, prototype UI, and milestone progress.',
      deadline: in3Days.iso,
      priority: 'high' as const,
    },
    { sender: 'Alex Rivera (You)', text: 'Dr. Kapoor just sent the slide template' },
    { sender: 'Maya Lin', text: 'I will design slides 1 to 4 with the UI screenshots' },
    { sender: 'Lucas Miller', text: 'I will take slides 5 and 6 with database schema and deduplication rules' },
    {
      sender: 'Elena Rostova',
      text: 'Hey team, meeting shifted to 5pm today on Google Meet: https://meet.google.com/ais-demo-sync. We will rehearse the slide deck!',
      isMeeting: true,
      title: 'Project Presentation Dry Run',
      details: 'Rehearse slide transitions, time the speaker parts, and test demo links.',
      deadline: thisThursday.iso,
      startTime: thisThursday.iso,
      endTime: new Date(new Date(thisThursday.iso).getTime() + 45 * 60000).toISOString(),
      location: 'Google Meet',
      meetingLink: 'https://meet.google.com/ais-demo-sync',
      attendees: ['Alex Rivera (You)', 'Maya Lin', 'Lucas Miller', 'Elena Rostova'],
      isAllDay: false,
      isRescheduled: true,
      rescheduledReason: 'Shifted to 5:00 PM per Elena',
      priority: 'high' as const,
    },
    { sender: 'Elena Rostova', text: 'I will do slides 7 and 8 with roadmap and testing coverage' },
    { sender: 'Alex Rivera (You)', text: 'Teamwork on point 🔥' },
    { sender: 'Maya Lin', text: 'SyncPulse is going to look super polished' },
    { sender: 'Lucas Miller', text: 'Absolutely' },
    { sender: 'Elena Rostova', text: 'See you guys in 15 mins on Google Meet!' },
    { sender: 'Alex Rivera (You)', text: 'Joining now 👍' },
    { sender: 'Lucas Miller', text: 'Joining' },
  ];

  const messages: Message[] = [];
  const items: ExtractedItem[] = [];

  // Populate CSE-4 messages & items
  cseRawMessages.forEach((raw, idx) => {
    const msgId = `msg-demo-cse-${idx + 1}`;
    const hash = `hash-cse-${idx + 1}-${raw.sender.replace(/\s+/g, '')}`;
    chat1.processedMessageHashes.push(hash);

    // Spread timestamps across the last 2 days
    const msgTime = new Date(Date.now() - (60 - idx) * 1000 * 60 * 18).toISOString();

    messages.push({
      id: msgId,
      chatId: chat1Id,
      sender: raw.sender,
      text: raw.text,
      timestamp: msgTime,
      hash,
    });

    if ('isAssignment' in raw && raw.isAssignment) {
      items.push({
        id: `item-cse-asg-${idx}`,
        chatId: chat1Id,
        type: 'assignment',
        title: raw.title!,
        details: raw.details!,
        sender: raw.sender,
        sourceMessage: raw.text,
        deadline: raw.deadline!,
        done: false,
        createdAt: msgTime,
        priority: raw.priority!,
      });
    } else if ('isDate' in raw && raw.isDate) {
      items.push({
        id: `item-cse-date-${idx}`,
        chatId: chat1Id,
        type: 'date',
        title: raw.title!,
        details: raw.details!,
        sender: raw.sender,
        sourceMessage: raw.text,
        deadline: raw.deadline!,
        done: false,
        createdAt: msgTime,
        priority: raw.priority!,
      });
    } else if ('isNotice' in raw && raw.isNotice) {
      items.push({
        id: `item-cse-not-${idx}`,
        chatId: chat1Id,
        type: 'notice',
        title: raw.title!,
        details: raw.details!,
        sender: raw.sender,
        sourceMessage: raw.text,
        deadline: raw.deadline!,
        done: false,
        createdAt: msgTime,
        priority: raw.priority!,
      });
    }
  });

  // Populate Project Team messages & items
  projectRawMessages.forEach((raw, idx) => {
    const msgId = `msg-demo-prj-${idx + 1}`;
    const hash = `hash-prj-${idx + 1}-${raw.sender.replace(/\s+/g, '')}`;
    chat2.processedMessageHashes.push(hash);

    const msgTime = new Date(Date.now() - (30 - idx) * 1000 * 60 * 14).toISOString();

    messages.push({
      id: msgId,
      chatId: chat2Id,
      sender: raw.sender,
      text: raw.text,
      timestamp: msgTime,
      hash,
    });

    if ('isAssignment' in raw && raw.isAssignment) {
      items.push({
        id: `item-prj-asg-${idx}`,
        chatId: chat2Id,
        type: 'assignment',
        title: raw.title!,
        details: raw.details!,
        sender: raw.sender,
        sourceMessage: raw.text,
        deadline: raw.deadline!,
        done: false,
        createdAt: msgTime,
        priority: raw.priority!,
      });
    } else if ('isDate' in raw && raw.isDate) {
      items.push({
        id: `item-prj-date-${idx}`,
        chatId: chat2Id,
        type: 'date',
        title: raw.title!,
        details: raw.details!,
        sender: raw.sender,
        sourceMessage: raw.text,
        deadline: raw.deadline!,
        done: false,
        createdAt: msgTime,
        priority: raw.priority!,
      });
    } else if ('isMeeting' in raw && raw.isMeeting) {
      const rawMeet = raw as any;
      items.push({
        id: `item-prj-meet-${idx}`,
        chatId: chat2Id,
        type: 'meeting',
        title: rawMeet.title || 'Project Meeting',
        details: rawMeet.details || '',
        sender: rawMeet.sender,
        sourceMessage: rawMeet.text,
        deadline: rawMeet.deadline || rawMeet.startTime,
        startTime: rawMeet.startTime || rawMeet.deadline,
        endTime: rawMeet.endTime || null,
        location: rawMeet.location || null,
        meetingLink: rawMeet.meetingLink || null,
        attendees: Array.isArray(rawMeet.attendees) ? rawMeet.attendees : [],
        isAllDay: Boolean(rawMeet.isAllDay),
        isRescheduled: Boolean(rawMeet.isRescheduled),
        rescheduledReason: rawMeet.rescheduledReason || null,
        done: false,
        createdAt: msgTime,
        priority: rawMeet.priority || 'medium',
      });
    }
  });

  // Create intelligent summaries
  const summaries: Summary[] = [
    {
      id: 'sum-demo-cse4',
      chatId: chat1Id,
      createdAt: now.toISOString(),
      casualCount: 54,
      dateCount: 1,
      assignmentCount: 2,
      noticeCount: 3,
      casualHighlights: [
        'Classmates discussing attendance and 9:02 AM roll call checks',
        'Sharing Computer Networks drive links and notes',
        'Print shop queues and lab record formatting advice',
        'Canteen tea and samosa coordination',
      ],
    },
    {
      id: 'sum-demo-prj',
      chatId: chat2Id,
      createdAt: now.toISOString(),
      casualCount: 27,
      dateCount: 1,
      assignmentCount: 2,
      noticeCount: 0,
      casualHighlights: [
        'Reviewing UI wireframe components and branch commits',
        'Dividing presentation slides between team members',
        'Coordinating evening Google Meet call timing',
      ],
    },
  ];

  return {
    chats: [chat1, chat2],
    messages,
    items,
    summaries,
  };
}
