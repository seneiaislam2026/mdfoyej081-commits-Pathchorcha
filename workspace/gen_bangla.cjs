const fs = require('fs');

const ekKothayRaw = `
অক্ষির অভিমুখে|প্রত্যক্ষ
অক্ষির অগোচরে|পরোক্ষ
অক্ষির সমীপে|সমক্ষ
অকালে যাকে বোধন করা হয়|অকালবোধন
অখাদ্য যে খায়|অখাদ্যভোজক
অগ্রে জন্মেছে যে|অগ্রজ
অগ্রে গমন করে যে|অগ্রগামী
অগ্রে বা পূর্বে যা ঘটেছিল|ভূতপূর্ব
অণুর ন্যায়|অণুবৎ
অতি দীর্ঘ নয় যা|নাতিদীর্ঘ
অতিশয় শীতল বা উষ্ণ নয়|নাতিশীতোষ্ণ
অতি শীত নয় অতি উষ্ণও নয়|নাতিশীতোষ্ণ
অন্য ভাষায় রূপান্তরিত|অনূদিত
অন্যের প্রতি যার বিদ্বেষ নেই|অনসূয়
অনুসন্ধান করার ইচ্ছা|অনুসন্ধিৎসা
অন্বেষণ করার ইচ্ছা|অন্বেষা
অবশ্যই যা ঘটবে|অবশ্যম্ভাবী
অরিন্দম|অরিকে দমন করে যে
অহংকার নেই যার|নিরহংকার
আকাশে চরে যে|খেচর
আকাশের সঙ্গে সম্পর্ক আছে যার|আকাশীয়
আচারে নিষ্ঠা আছে যার|আচারনিষ্ঠ
আট প্রহর যা পরা যায়|আটপৌরে
আপনি যে নিজের বশ|স্বয়ংবশ
আপনার রং লুকিয়ে রাখে যে|বর্ণচোরা
আদি থেকে অন্ত পর্যন্ত|আদ্যন্ত
আয় বুঝে ব্যয় করে যে|মিতব্যয়ী
আয়ু কম যার|অল্পায়ু
আলাপ করতে পটু যে|আলাপি
আলোচনা করা হচ্ছে যা|আলোচ্য
ইতিহাস বিষয়ে অভিজ্ঞ যিনি|ঐতিহাসিক
ইন্দ্রিয়কে জয় করেছেন যিনি|জিতেন্দ্রিয়
ইন্দ্রকে জয় করেছে যে|ইন্দ্রজিৎ
ইহলোকে যা সামান্য নয়|অলোকা সামান্য
ঈষৎ আমিষ গন্ধ যার|আঁশটে
ঈষৎ পান্ডুবর্ণ|ধূসর
উদর সর্বস্ব যার|উদরসর্বস্ব
উপকারীর অপকার করে যে|কৃতঘ্ন
উপকারীর উপকার স্বীকার করে যে|কৃতজ্ঞ
উপকারীর উপকার স্বীকার করে না যে|অকৃতজ্ঞ
উপন্যাস রচয়িতা|ঔপন্যাসিক
উপস্থিত বুদ্ধি আছে যার|প্রত্যুৎপন্নমতি
উভয় হাত সমানে চলে যার|সব্যসাচী
ঋষি কর্তৃক উক্ত|আর্ষ
একই গুরুর শিষ্য|সতীর্থ
একই মাতার উদরে জন্ম যাদের|সহোদর
একুশ বছর বয়স যার|একুশে
ঐতিহ্য সম্পর্কীয়|ঐতিহ্যিক
কর্ম সম্পাদনে পরিশ্রমী|কর্মঠ
কর্মে যার ক্লান্তি নাই|অক্লান্তকর্মী
কল্পনা করা যায় পণ্ডিত|অকল্পনীয়
কাউকে যে ভয় পায় না|অকুতোভয়
কাজে যে পটু নহে|অপটু
কাজের দায়িত্ব যে নিয়েছে|ভারপ্রাপ্ত
কালের অতীত|কালাতীত
কূলের সমীপে|উপকূল
কৃতকর্মের জন্য অনুতপ্ত|অনুতপ্ত
কোথাও উঁচু কোথাও নিচু|বন্ধুর
কোনো কিছুতেই ভয় নেই যার|অকুতোভয়
ক্রম থেকে যার বিচ্যুতি ঘটে নি|অবিচ্যুত
ক্ষমা করার ইচ্ছা|তিক্ষমা
খণ্ডন করা যায় না যা|অখণ্ডনীয়
খ্যাতি আছে যার|খ্যাতিমান
খ্রিস্টের জন্মের পূর্বের সময়|খ্রিস্টপূর্ব
গভীর জ্ঞান আছে যার|জ্ঞানী
গোপনে যে কাজ করে|গুপ্তচর
গ্রন্থ রচয়িতা|গ্রন্থকার
গ্রীষ্মের কাল|গ্রীষ্মকাল
গৃহস্থের মতো আচরণ|গৃহস্থালি
গোরস্থানের রক্ষণাবেক্ষণকারী|গোরক্ষক
গৌণ নয় যা|মুখ্য
চক্ষুর সামনে সংঘটিত|চাক্ষুষ
চঞ্চল নয় যা|অচঞ্চল
চার রাস্তার মিলনস্থল|চৌরাস্তা
চিকিৎসা করেন যিনি|চিকিৎসক
জানতে ইচ্ছুক|জিজ্ঞাসু
জন্মান্ধ যে|জন্ম থেকেই অন্ধ
জয়ের জন্য যে উৎসব|জয়ন্তী
জয় করার ইচ্ছা|জিগীষা
জলে স্থলে চরে যে|উভচর
জলে জন্মে যা|জলজ
জলে চরে যে|জলচর
জীবিত থেকেও যে মৃতের মতো|জীবন্মৃত
তত্ত্ব জানেন যিনি|তত্ত্বজ্ঞানী
তিন ফলের সমাহার|ত্রিফলা
তেজ আছে যার|তেজস্বী
ত্রুটি হীন যা|নির্ভুল
দয়া নেই যার|নির্দয়
দমন করা যায় না যাকে|অদম্য
দিনে একবার আহার করেন যিনি|একাহারী
দুই কান কাটা যার|দুকানকাটা
দেখতে সুন্দর যে|সুদর্শন
দেখার ইচ্ছা|দিদৃক্ষা
দেহের সঙ্গে বর্তমান|সদেহ
দেশকে ভালোবাসে যে|দেশপ্রেমিক
ধূলা থেকে উৎপন্ন|ধূলিজাত
নষ্ট হয় যা|নশ্বর
নষ্ট হয় না যা|অবিনশ্বর
নারী যে পুরুষের নিকট আত্মসমর্পণ করে|আত্মসমর্পিতা
নিজে যা অর্জিত|স্বোপার্জিত
নিজের কর্মে নিষ্ঠা আছে যার|কর্মনিষ্ঠ
পথ চলার খরচ|পাথেয়
পশ্চাতে গমন করে যে|অনুগামী
পা থেকে মাথা পর্যন্ত|আপাদমস্তক
পানের যোগ্য|পেয়
পাপ করে নি যে|নিষ্পাপ
পিতার মৃত্যুর পর জন্ম যার|মরণোত্তর
পূর্বে যা ছিল এখন নেই|ভূতপূর্ব
পূর্বে শোনা যায় নি যা|অশ্রুতপূর্ব
ফল পাকলে যে গাছ মরে যায়|ওষধি
বক্তব্য যা|বক্তব্য
বচনের অতীত|অনির্বচনীয়
বর্ণনা করা যায় না যাকে|অবর্ণনীয়
বিনা বেতনে|অবৈতনিক
বিজ্ঞান জানেন যিনি|বিজ্ঞানী
বিষয় থেকে বিষয়ান্তরে|বিষয়ান্তর
বিষ্ণুর উপাসক|বৈষ্ণব
মধু পান করে যে|মধুঁপ
মনুষ্য নয় যা|অমানুষ
মর্মে আঘাত দেয় যা|মর্মান্তিক
মৃত্তিকা দিয়ে তৈরি|মৃন্ময়
মৃত্যু অব্দি|আমৃত্যু
যশ আছে যার|যশস্বী
যা অধ্যয়ন করা হয়েছে|অধীত
যা উদিত হচ্ছে|উদীয়মান
যা ক্রমশ বর্ধমান|বর্ধিষ্ণু
যা দমন করা কষ্টকর|দুর্দমনীয়
যা পান করা যায়|পেয়
যা প্রমাণ করা যায় না|অপ্রমাণ্য
যা বর্ণনার অতীত|অবর্ণনীয়
যা বলা হয় নি|অনুক্ত
যা সহজে পাওয়া যায়|সুলভ
যা সহজে লাভ করা যায় না|দুর্লভ
যা সাধিত হয়েছে|সাধিত
যা সাধন করা যায়|সাধ্য
যিনি শিক্ষা দান করেন|শিক্ষক
যে নারী নিজে বর নির্বাচন করে|স্বয়ংবরা
যে বস্তু থেকে রস নির্গত হয়|রসাল
শত্রুকে বধ করে যে|শত্রুঘ্ন
শুনে যে মনে রাখতে পারে|শ্রুতিধর
সর্ব বিষয়ে যে সমান পারদর্শী|সর্বজ্ঞ
সব কিছু যে সহ্য করে|সর্বংসহা
স্বয়ং যা সৃষ্টি হয়েছে|স্বয়ম্ভূ
হাঁসফাঁস করে যে|উসখুস
হরিণের চামড়া|অজিন
ক্ষমা করার যোগ্য|ক্ষমার্হ
দিনের আলো ও সন্ধ্যার আলো মিলে যায় যখন|গোধূলি
মায়া জানে না যে|মায়াহীন
আয়ু নেই যার|নিরায়ু
মেঘের ডাকা|মন্দ্র
অশ্বের ডাক|হ্রেষা
হাতির ডাক|বৃংহিত
সিংহের ডাক|নাদ
ভ্রমরের শব্দ|গুঞ্জন
কোকিলের ডাক|কুহু
পাখির ডাক|কূজন
শত্রুর ভয় নেই যার|অজাতশত্রু
যে নিজের নাম লুকিয়ে রাখে|নামচোরা
যার বুদ্ধি কম|নির্বোধ
যার স্ত্রী মারা গেছে|বিপত্নীক
যে নারী বিধবা|বিধবা
যাকে দেখা যায় না|অদৃশ্য
যার শত্রু জন্মায়নি|অজাতশত্রু
যেখানে পৌঁছানো যায় না|অগম্য
`;

const paribhashikRaw = `
Academy|একাডেমি/পর্ষদ
Accommodation|আবাসন
Account|হিসাব
Act|আইন/কাজ
Action|ব্যবস্থা/কাজ
Ad hoc|অস্থায়ী/তদর্থক
Administrator|প্রশাসক
Admit|ভর্তি/স্বীকার
Adult|প্রাপ্তবয়স্ক
Advisor|উপদেষ্টা
Affidavit|হলফনামা
Agency|সংস্থা
Agent|প্রতিনিধি
Allotment|বরাদ্দ
Allowance|ভাতা
Amendment|সংশোধনী
Annual|বার্ষিক
Applicant|আবেদনকারী
Appoint|নিয়োগ করা
Approval|অনুমোদন
Architecture|স্থাপত্য
Assistance|সহায়তা
Auction|নিলাম
Audit|নিরীক্ষা
Authority|কর্তৃপক্ষ
Bail|জামিন
Balance|উদ্বৃত্ত/ভারসাম্য
Ballot|ভোট/ব্যালট
Ban|নিষেধাজ্ঞা
Bankrupt|দেউলিয়া
Basic|মৌলিক
Benefit|সুবিধা/ভাতা
Bill|বোর্ড/হিসাব
Board|বোর্ড/পর্ষদ
Bond|চুক্তিপত্র
Bonus|বোনাস/অতিরিক্ত লাভ
Border|সীমান্ত
Brand|ব্র্যান্ড/মার্ক
Bribe|ঘুষ
Budget|বাজেট/আয়ব্যয়ক
Bulletin|বুলেটিন/জ্ঞাপক
Bylaw|উপবিধি
Cabinet|মন্ত্রিসভা
Cadre|ক্যাডার/কর্মীবৃন্দ
Camp|শিবির
Campaign|প্রচারণা
Cancel|বাতিল
Candidate|প্রার্থী
Capital|মূলধন/রাজধানী
Card|পরিচয়পত্র/কার্ড
Case|মামলা/প্রসঙ্গ
Cash|নগদ
Category|শ্রেণী/বিভাগ
Caucus|ককাস
Census|আদমশুমারি
Certificate|সনদপত্র
Chamber|প্রকোষ্ঠ/কক্ষ
Charge|অভিযোগ/দায়িত্ব
Charter|সনদ
Check|চেক/যাচাই
Chief|প্রধান
Citizen|না নাগরিক
Civil|বেসামরিক/নাগরিক
Claim|দাবি
Clause|দফা/অনুচ্ছেদ
Clerk|করণিক
Code|বিধি/সংকেত
Collection|সংগ্রহ
College|মহাবিদ্যালয়
Column|স্তম্ভ
Commerce|বাণিজ্য
Commission|কমিশন
Committee|কমিটি/সমিতি
Company|কোম্পানি/প্রতিষ্ঠান
Condition|শর্ত/অবস্থা
Conference|সম্মেলন
Conflict|দ্বন্দ্ব/সংঘাত
Constitution|সংবিধান
Contract|চুক্তি
Control|নিয়ন্ত্রণ
Co-operation|সমবায়/সহযোগিতা
Copy|অনুলিপি
Corporation|করপোরেশন/নিগম
Council|পরিষদ
Court|আদালত
Crime|অপরাধ
Crisis|সঙ্কট
Culture|সংস্কৃতি
Custom|শুল্ক/প্রথা
Data|উপাত্ত
Date|তারিখ
Dealer|পরিবেশক
Debate|বিতর্ক
Debt|ঋণ
Decision|সিদ্ধান্ত
Declaration|ঘোষণা
Deed|দলিল
Defence|প্রতিরক্ষা
Degree|ডিগ্রি/মাত্রা
Delay|বিলম্ব
Demand|চাহিদা
Democracy|গণতন্ত্র
Department|দপ্তর/বিভাগ
Deposit|আমানত/জমা
Deputy|উপ/প্রতিনিধি
Design|নকশা
Dictator|একনায়ক
Dictionary|অভিধান
Director|পরিচালক
Discount|বাট্টা/ছাড়
Draft|খসড়া
Duty|দায়িত্ব/শুল্ক
Economy|অর্থনীতি
Editor|সম্পাদক
Education|শিক্ষা
Election|নির্বাচন
Embassy|দূতাবাস
Employee|কর্মচারী
Employer|নিয়োগকর্তা
Employment|কর্মসংস্থান
Energy|শক্তি
Engineer|প্রকৌশলী
Environment|পরিবেশ
Estate|এস্টেট/সম্পত্তি
Estimate|প্রাক্কলন
Event|ঘটনা
Evidence|প্রমাণ/সাক্ষ্য
Exchange|বিনিময়
Exhibition|প্রদর্শনী
Expert|বিশেষজ্ঞ
Export|রপ্তানি
Fact|তথ্য/ঘটনা
Factory|কারখানা
Fee|ফি/মাশুল
Festival|উৎসব
File|নথি
Finance|অর্থসংস্থান/অর্থ
Fine|জরিমানা
Firm|ফার্ম/প্রতিষ্ঠান
Fiscal|আর্থিক
Focus|কেন্দ্রবিন্দু
Force|বাহিনী/বল
Foreign|বৈদেশিক
Form|ফরম/রূপ
Format|বিন্যাস
Foundation|ভিত্তি/ফাউন্ডেশন
Fraud|প্রতারণা
Fund|তহবিল
Gallery|গ্যালারি
Gazette|গেজেট
General|সাধারণ/জেনারেল
Global|বৈশ্বিক
Goal|লক্ষ্য
Goods|পণ্য
Governance|শাসন
Government|সরকার
Grammar|ব্যাকরণ
Grant|মঞ্জুরি
Guarantee|নিশ্চয়তা
Guideline|নির্দেশিকা
Headquarters|সদর দপ্তর
Health|স্বাস্থ্য
Heritage|ঐতিহ্য
History|ইতিহাস
Honorarium|সম্মানী
Hospital|হাসপাতাল
Hostel|ছাত্রাবাস
Identity|পরিচয়
Import|আমদানি
Incharge|ভারপ্রাপ্ত
Income|আয়
Index|সূচক
Industry|শিল্প
Information|তথ্য
Initials|আদ্যক্ষর
Inquiry|অনুসন্ধান/তদন্ত
Inspector|পরিদর্শক
Institute|প্রতিষ্ঠান
Insurance|বীমা
Interest|সুদ/আগ্রহ
Interview|সাক্ষাৎকার
Investment|বিনিয়োগ
Issue|ইস্যু/বিষয়
Item|দফা/পদ
Joint|যৌথ
Journal|সাময়িকী/জার্নাল
Judge|বিচারক
Justice|বিচার/ন্যায়
Key|চাবিকাঠি/মূল
Knowledge|জ্ঞান
Label|লেবেল/নামপত্র
Labor|শ্রম
Land|জমি/ভূমি
Language|ভাষা
Law|আইন
Leader|নেতা
Lease|ইজারা
Leave|ছুটি
Legal|আইনগত
Letter|চিঠি
Level|স্তর
Library|গ্রন্থাগার
License|লাইসেন্স/অনুমতিপত্র
Limit|সীমা
List|তালিকা
Loan|ঋণ
Local|স্থানীয়
Logic|যুক্তি
Loss|ক্ষতি/লোকসান
Lump sum|এককালীন থোক
Magazine|পত্রিকা
Maintain|রক্ষণাবেক্ষণ
Manager|ব্যবস্থাপক
Manifesto|ইশতেহার
Map|মানচিত্র
Margin|প্রান্তিক
Market|বাজার
Mayor|মেয়র
Measure|পরিমাপ
Media|গণমাধ্যম
Medical|চিকিৎসা
Meeting|সভা
Member|সদস্য
Memorandum|স্মারকলিপি
Message|বার্তা
Method|পদ্ধতি
Minister|মন্ত্রী
Minority|সংখ্যালঘু
Minute|কার্যবিবরণী
Model|মডেল/আদর্শ
Money|অর্থ/টাকা
Monitor|নজরদারি/মনিটর
Motion|প্রস্তাব/গতি
Motive|উদ্দেশ্য
Museum|জাদুঘর
Nation|জাতি
National|জাতীয়
Nature|প্রকৃতি
Navy|নৌবাহিনী
Network|নেটওয়ার্ক
News|সংবাদ
Note|নোট/টিকা
Notice|নোটিশ/বিজ্ঞপ্তি
Oath|শপথ
Object|উদ্দেশ্য/বস্তু
Observation|পর্যবেক্ষণ/মন্তব্য
Occupation|পেশা
Office|কার্যালয়
Officer|কর্মকর্তা
Official|দাপ্তরিক/কর্মকর্তা
Opinion|মতামত
Order|আদেশ/ক্রম
Ordinance|অধ্যাদেশ
Organization|সংস্থা/সংগঠন
Origin|উৎস
Output|ফলাফল/উৎপাদন
Owner|মালিক
Panel|প্যানেল
Paper|কাগজ/পত্র
Parliament|সংসদ
Part|অংশ
Partner|অংশীদার
Party|দল/পক্ষ
Pass|পাস/ছাড়পত্র
Passport|পাসপোর্ট/ছাড়পত্র
Patent|পেটেন্ট
Pay|বেতন
Peace|শান্তি
Penalty|জরিমানা/দণ্ড
Pension|পেনশন/অবসরভাতা
Period|সময়কাল
Permit|অনুমতিপত্র
Person|ব্যক্তি
Phase|পর্যায়
Plan|পরিকল্পনা
Police|পুলিশ
Policy|নীতি
Position|অবস্থান/পদ
Power|ক্ষমতা/শক্তি
Practice|অনুশীলন/প্রথা
President|সভাপতি/রাষ্ট্রপতি
Price|মূল্য
Principle|নীতি
Prison|কারাগার
Prize|পুরস্কার
Problem|সমস্যা
Process|প্রক্রিয়া
Product|পণ্য
Profession|পেশা
Profile|জীবনবৃত্তান্ত/প্রোফাইল
Program|কর্মসূচি
Project|প্রকল্প
Proof|প্রমাণ
Property|সম্পত্তি
Proposal|প্রস্তাব
Protocol|প্রটোকল
Public|জনসাধারণ
Publication|প্রকাশনা
Qualification|যোগ্যতা
Quality|মান
Quantity|পরিমাণ
Quarter|ত্রৈমাসিক/প্রান্তিক
Question|প্রশ্ন
Quota|কোটা/অংশ
Quote|উদ্ধৃতি
Rate|হার
Ratio|অনুপাত
Rebate|রেয়াত
Receipt|রশিদ
Record|নথি/রেকর্ড
Recovery|পুনরুদ্ধার/আদায়
Reference|তথ্যসূত্র
Reform|সংস্কার
Region|অঞ্চল
Register|নিবন্ধন
Regulation|প্রবিধান
Rehabilitation|পুনর্বাসন
Relief|ত্রাণ
Religion|ধর্ম
Remedy|প্রতিকার
Rent|ভাড়া
Report|প্রতিবেদন
Republic|প্রজাতন্ত্র
Request|অনুরোধ
Requirement|প্রয়োজনীয়তা
Research|গবেষণা
Reserve|সংরক্ষিত ব্যবস্থা
Resolution|সিদ্ধান্ত/প্রস্তাব
Resource|সম্পদ
Rest|বিশ্রাম/বাকি
Result|ফলাফল
Revenue|রাজস্ব
Review|পর্যালোচনা
Revision|সংশোধন
Reward|পুরস্কার
Right|অধিকার
Role|ভূমিকা
Rule|বিধি
Salary|বেতন
Sample|নমুনা
Sanction|মঞ্জুরি/অনুমোদন
Saving|সঞ্চয়
Scale|স্কেল/মাপ
Schedule|তফসিল/সময়সূচি
Scheme|পরিকল্পনা/প্রকল্প
Science|বিজ্ঞান
Scope|সুযোগ/পরিধি
Score|স্কোর
Scrap|বাতিল/উচ্ছিষ্ট
Seal|সিলমোহর
Search|তল্লাশি/অনুসন্ধান
Season|ঋতু
Seat|আসন
Secretary|সচিব/সম্পাদক
Section|শাখা
Security|নিরাপত্তা/জামানত
Selection|নির্বাচন/বাছাই
Seminar|সেমিনার/আলোচনা সভা
Senior|জ্যেষ্ঠ
Sentence|বাক্য/দণ্ড
Series|ক্রম/পর্যায়
Service|সেবা/চাকরি
Session|অধিবেশন
Set|সেট/গুচ্ছ
Settlement|নিষ্পত্তি
Share|শেয়ার/অংশ
Sheet|পত্র
Shift|পালা/বদল
Sign|চিহ্ন/স্বাক্ষর
Signature|স্বাক্ষর
Site|স্থান
Situation|অবস্থা/পরিস্থিতি
Skill|দক্ষতা
Society|সমাজ/সমিতি
Software|সফটওয়্যার
Solution|সমাধান
Source|উৎস
Space|স্থান/মহাকাশ
Speaker|বক্তা/স্পিকার
Special|বিশেষ
Speech|বক্তৃতা
Sponsor|পৃষ্ঠপোষক
Staff|কর্মচারীবৃন্দ
Stage|পর্যায়/মঞ্চ
Stamp|স্ট্যাম্প/ডাকটিকেট
Standard|মান
State|রাষ্ট্র/অবস্থা
Statement|বিবৃতি/হিসাব
Station|স্টেশন/কেন্দ্র
Status|মর্যাদা/অবস্থা
Stock|মজুদ
Strategy|কৌশল
Strike|ধর্মঘট
Structure|কাঠামো
Student|ছাত্র/ছাত্রী
Study|অধ্যয়ন/সমীক্ষা
Subject|বিষয়/প্রজা
Submission|পেশ/দাখিল
Substitute|বিকল্প
Success|সাফল্য
Summary|সারসংক্ষেপ
Summit|শীর্ষ সম্মেলন
Supply|সরবরাহ
Support|সমর্থন
Supreme|সর্বোচ্চ
Surface|উপরিভাগ
Survey|জরিপ
Symbol|প্রতীক
System|পদ্ধতি/ব্যবস্থা
Table|সারণি
Target|লক্ষ্যমাত্রা
Task|কাজ
Tax|কর
Team|দল
Technology|প্র প্রযুক্তি
Term|মেয়াদ/শর্ত
Test|পরীক্ষা
Text|পাঠ্য
Theory|তত্ত্ব
Time|সময়
Title|শিরোনাম/উপাধি
Tool|হাতিয়ার/টুল
Topic|আলোচ্য বিষয়
Total|মোট
Tour|সফর
Trade|বাণিজ্য
Training|প্রশিক্ষণ
Transaction|লেনদেন
Transfer|বদলীকরণ/হস্তান্তর
Transport|পরিবহন
Treaty|চুক্তি
Trial|বিচার/পরীক্ষা
Tribe|উপজাতি
Trust|ট্রাস্ট/বিশ্বাস
Type|ধরন
Union|ইউনিয়ন/সংঘ
Unit|একক
University|বিশ্ববিদ্যালয়
Usage|ব্যবহার
Valid|বৈধ
Value|মূল্য
Vehicle|যানবাহন
Verification|যাচাই
Version|সংস্করণ
Veto|ভিটো
Victory|বিজয়
View|দৃষ্টিভঙ্গি/মতামত
Village|গ্রাম
Visa|ভিসা
Vision|রূপকল্প/দৃষ্টি
Visit|পরিদর্শন
Voice|কণ্ঠস্বর/বাচ্য
Volume|খণ্ড/আয়তন
Vote|ভোট
Voucher|ভাউচার/প্রমাণপত্র
Wage|মজুরি
Warning|সতর্কবার্তা
Warrant|পরোয়ানা
Wealth|সম্পদ
Week|সপ্তাহ
Weight|ওজন
Welfare|কল্যাণ
White paper|শ্বেতপত্র
Will|ইচ্ছাপত্র/উইল
Withdrawal|প্রত্যাহার
Witness|সাক্ষী
Woman|নারী
Word|শব্দ
Work|কাজ
Worker|কর্মী
Workshop|কর্মশালা
World|বিশ্ব
Worship|উপাসনা
Writer|লেখক
Year|বছর
Youth|যুবক/তারুণ্য
Zone|অঞ্চল/মণ্ডল
`;

let ekKothayCount = 2000;
const ekKothayItems = ekKothayRaw.split('\n').filter(line => line.trim().length > 0).map((line) => {
    const [meaning, wordPart] = line.split('|');
    if (!wordPart) return null;
    return {
        id: "ek_kothay_bcs_" + ekKothayCount++,
        word: wordPart.trim(), 
        language: "bangla",
        category: "ek_kothay",
        meaning: meaning.trim(),
        synonyms: [],
        antonyms: [],
        example: ""
    };
}).filter(Boolean);

let paribhashikCount = 3000;
const paribhashikItems = paribhashikRaw.split('\n').filter(line => line.trim().length > 0).map((line) => {
    const [english, bangla] = line.split('|');
    if (!bangla) return null;
    return {
        id: "paribhashik_" + paribhashikCount++,
        word: english.trim(),
        language: "bangla",
        category: "paribhashik",
        meaning: bangla.trim(),
        synonyms: [],
        antonyms: [],
        example: ""
    };
}).filter(Boolean);

const ekKothayContent = `import { WordItem } from "./vocabularyData";
export const ADDITIONAL_EK_KOTHAY: WordItem[] = ${JSON.stringify(ekKothayItems, null, 2)};
`;

const paribhashikContent = `import { WordItem } from "./vocabularyData";
export const PARIBHASHIK_SHOBDO: WordItem[] = ${JSON.stringify(paribhashikItems, null, 2)};
`;

fs.writeFileSync('src/data/ekKothayProkashData.ts', ekKothayContent);
fs.writeFileSync('src/data/paribhashikShobdoData.ts', paribhashikContent);

