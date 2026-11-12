# Saare prompts (copy karne ke liye)

Har box ke upar right mein **copy** ka button hai (phone par bhi). Copy karo, Claude app mein paste karo, aur `[ ]` wala hissa apne hisaab se badlo (jaise `karna-kavach` ki jagah apni reel ka naam).

Ye wahi prompts hain jo guide "AI Se Cinematic Pauranik Reels" mein hain. Kahan bhejna hai (normal chat ya Code tab) har prompt ke upar likha hai.

## PROMPT · MADAD MAANGNE KE LIYE
**Kahan:** Claude app ki normal chat mein

```text
Ye meri reel banane wali guide hai. Main bilkul beginner hoon aur mujhe English kam aati hai.
Page 12 ka Step 3 samajh nahi aaya. Mujhe bahut aasaan Hinglish mein,
ek-ek karke samjhao ki kya dabana hai. Agar screenshot chahiye to mujhse maang lo.
```

## PROMPT · PC SETUP (SIRF EK BAAR)
**Kahan:** Code tab mein paste karo

```text
Main Instagram ke liye cinematic 2.5D pauranik reels banana chahta hoon. Mujhe coding nahi
aati, isliye saara technical kaam tum karo aur mujhe simple Hinglish mein ek-ek line mein batao.

Ye folder ek ready Remotion reel template hai. CLAUDE.md, README.md aur
.claude/skills/cinematic-reel/SKILL.md padh lo. Phir:
1. Check karo Node.js (version 20 ya upar), FFmpeg aur Git installed hain. Nahi hain to
   install karo (Windows par winget, Mac par Homebrew). Install ke baad dobara check karo.
2. Agar ZIP ke andar ek aur folder bana hai, to saari files seedha is folder mein le aao.
3. Is folder mein npm install chalao.
4. npm run preview -- example chala ke test reel ka preview banao.
5. reels/example/preview.mp4 file mere liye khol do, taaki main dekh sakoon.
Koi error aaye to khud fix karo. Har step ke baad ek line mein batao kya hua.
```

## PROMPT T · PEHLI TEST REEL
**Kahan:** Code tab mein

```text
Ye mera cinematic reel template hai. CLAUDE.md padh lo.
Environment settings bilkul mat badalna. Kuch install karna ho to repo ke andar khud
bash setup.sh chalao. Phir reels/example ki poori reel banao (npm run reel -- example),
use commit karke push karo, aur mujhe batao video kis branch mein aur kahan hai.
```

## FIX · ENVIRONMENT
**Kahan:** Usi session mein

```text
Environment settings mat badlo. Repo folder ke andar khud
bash setup.sh chalao aur aage badho.
```

## PROMPT 1 · TOPIC IDEAS
**Kahan:** Claude app ki normal chat

```text
Mujhe Instagram reels ke liye Ramayan, Mahabharat aur Puranon se 10 kahani ideas do,
jo log kam jaante hon. Har idea ke saath likho:
- ek line ka hook (virodhabhas ya "main ___ hoon" ya "kyun?" wala)
- kahani kis granth mein hai (ya ye lok katha hai)
- koi aane wala tyohaar ho to us se jodo
- is kahani ki seekh kya hai
Koi kahani mat banana. Sirf wahi jo granthon ya lok parampara mein sach mein hai.
```

## PROMPT 2 · SCRIPT LIKHWAO
**Kahan:** Claude app ki normal chat

```text
Is kahani par Instagram reel ki voiceover script likho: [kahani ka naam]
Niyam:
- 60-90 second, lagbhag 120-180 shabd
- Pehli line hi zabardast hook ho, koi "namaste" ya bhoomika nahi
- Har line chhoti (4-10 shabd), alag line mein, full stop ke saath
- Dialogue ho, beech mein ek sawaal, end mein "aaj bhi..." ya cliffhanger
- Ek achhi seekh ho. Granth ka naam ek baar bolo. Lok katha ho to saaf bolo.
- Kuch bhi apni taraf se mat banana
Mujhe script DO roop mein do, line se line same:
(A) Devanagari mein, ElevenLabs ke liye. Jahan emotion badle wahan [calm], [serious],
    [whispers] jaisa tag lagao, bas 3-4 jagah.
(B) Wahi lines Hinglish (Roman) mein, subtitles ke liye. Isme tag mat lagana.
Script ke baad 3 alag hook lines bhi do aur batao kaun si sabse strong hai.
```

## PROMPT 3 · SACH KI JAANCH (FACT CHECK)
**Kahan:** Script milte hi

```text
Ab is script ki ek-ek line check karo:
- Kaun si baat kis granth mein hai (Valmiki Ramayan, Mahabharat, kaunsa Puran)?
- Kaun si baat lok katha ya baad ki parampara hai?
- Koi baat galat, badha-chadha ke ya banayi hui to nahi?
- Kisi devi-devta ka apmaan ya galat chitran to nahi?
Galti mile to sahi karke poori script dobara do (dono roop mein).
```

## PROMPT 4A · AASAAN TAREEKA (AWAAZ CHAT MEIN)
**Kahan:** Code tab, naya session + MP3 attach

```text
Is message ke saath meri awaaz ki MP3 file attach hai. Is reel ka naam karna-kavach rakho.
Awaaz ko reels/karna-kavach/ folder mein save karo, aur neeche wali script ko usi
folder mein script.txt bana ke save karo (shabd bilkul mat badalna).
Phir CLAUDE.md ke niyam aur cinematic-reel skill follow karke cinematic 2.5D reel banao.
Environment settings mat badalna, zaroorat ho to bash setup.sh chalao. Pehle scene plan
dikhao, phir sirf 15 second ka preview banao, check.jpg dekh ke galtiyan theek karo,
commit + push karo aur batao preview kahan hai. Poori reel abhi mat banana.

Script:
[yahan apni (B) Hinglish script paste karo]
```

## PROMPT 4 · NAYI REEL KA PREVIEW
**Kahan:** Code tab, har reel ke liye

```text
reels/karna-kavach folder mein meri awaaz aur script.txt hai. CLAUDE.md ke niyam aur
cinematic-reel skill follow karke is kahani ki cinematic 2.5D reel banao.
- Environment settings mat badalna. Kuch install karna ho to bash setup.sh chalao.
- Pehle kahani achhi tarah samjho (ho sake to internet par sahi kahani aur
  characters ka roop check karo).
- Mujhe scene plan dikhao: har scene mein kya dikhega, kaun se characters, kaisi roshni.
- Is kahani ke characters naye design karo (asli insaan jaisa shareer) aur save karo.
- Kahani ke hisaab se background music aur sound effects lagao.
- Phir sirf pehle 15 second ka preview banao, check.jpg dekh ke galtiyan khud theek karo,
  commit karke push karo, aur batao preview kis branch mein aur kahan hai.
Poori reel abhi mat banana.
```

## PROMPT 5 · BADLAAV (EXAMPLE)
**Kahan:** Usi session mein

```text
Preview dekha. Ye badlaav karo:
1. Scene 2 mein Karna ka chehra aur paas se dikhao (close-up), camera dheere andar jaaye.
2. Kavach ki sunehri chamak tez karo. Roshni shaam wali laal-naarangi rakho.
3. Background music 30% dheema karo, aur dhamake ki awaaz "kavach" shabd par aaye.
4. Scene 4 mein Indra dev ke haath ajeeb mude hain, unhe seedha karo.
Phir dobara 15 second ka preview banao aur push karo.
```

## PROMPT 6 · FINAL REEL
**Kahan:** Preview OK hone ke baad

```text
Preview badhiya hai. Ab isi style mein poori reel end tak banao (render background mein
chalao, jaldi mat karo). Bante hi check.jpg mein har scene dekho ki kahin overlap ya galti
na ho. Phir final reel.mp4 commit karke push karo aur batao file kis branch mein aur kahan hai.
```

## PROMPT 7 · CAPTION + HASHTAGS
**Kahan:** Claude app ki normal chat

```text
Is pauranik reel ke liye Instagram caption likho: [kahani ek line mein]
- 2-3 line, Hinglish, kahani ki seekh ke saath
- Granth ka naam ho (ya "lok katha")
- Jhootha clickbait nahi ("99% log nahi jaante" jaisa nahi)
- End mein 5-8 sahi hashtags
Saath mein ek pinned comment bhi likho jo log ko apni raay likhne ke liye bulaaye.
```

## PROMPT 8 · JAGAH KHAALI KARO
**Kahan:** Code tab

```text
Repo kitna bada ho gaya hai, batao. Saari reels ke preview.mp4 aur reference screen
recordings hata do, aur jo reels main bataun unki reel.mp4 bhi hata do (pehle mujhse
poochh lena). Characters (src/characters) mat hatana. Phir commit aur push karo.
```

## PROMPT 9 · MASTER: STYLE + SCRIPT INSPIRATION
**Kahan:** Code tab, naya session

```text
reels/karna-kavach folder mein ek reel ki screen recording (ya screenshots) hai jiska style
mujhe pasand aaya. cinematic-reel skill ka style-inspiration tareeka follow karo.
Environment settings mat badalna, zaroorat ho to bash setup.sh chalao.
1. npm run ref -- karna-kavach chala ke reference ko dhyan se dekho.
2. VIDEO STYLE CARD banao: rang, roshni, camera, scene kitni jaldi badalte hain,
   transitions, music ka mood. Lagbhag 60-70% unke jaisa, baaki 30-40% hamara apna
   (wo 3 cheezein saaf likho).
3. SCRIPT DNA banao (subtitles padh ke): hook ka type, har line kitne shabd, dialogue,
   sawaal kahan, twist kahan, ant kaisa. Unke shabd nahi, sirf dhaancha.
4. Isi DNA se meri kahani [kahani ka naam] par bilkul NAYI script likho, 60-90
   second. Unke koi bhi 4 shabd lagataar same nahi hone chahiye. Sach ki jaanch karo,
   granth ka naam ek baar, lok katha ho to saaf bolo, ek achhi seekh.
5. Style card style.txt mein aur (B) Hinglish script script.txt mein save karo.
   (A) Devanagari script (ElevenLabs ke liye, 3-4 jagah [calm]/[serious]/[whispers])
   mujhe chat mein do.
6. Commit + push karo. Abhi video mat banana.
Unke characters, drawing, logo, awaaz ya music bilkul copy mat karna.
```

## PROMPT 10 · SIRF SCRIPT KA STYLE
**Kahan:** Normal chat + screenshots

```text
Ye ek viral reel ke screenshots hain (subtitles ke saath). Mujhe iski SCRIPT ka style
pasand aaya, shabd nahi. Pehle iska SCRIPT DNA ek chhoti table mein batao: hook ka
formula, har line kitne shabd, dialogue kitna, sawaal kahan, twist kahan, ant kaisa,
bolne ki raftaar. Phir isi DNA se meri kahani [kahani ka naam] par bilkul NAYI
script likho. Unke koi bhi 4 shabd lagataar same nahi hone chahiye. Niyam: 60-90 second,
chhoti lines, granth ka naam ek baar, lok katha ho to saaf bolo, kuch bhi banaya hua nahi,
ek achhi seekh. Do roop do: (A) Devanagari ElevenLabs ke liye (3-4 emotion tag),
(B) Hinglish subtitles ke liye.
```

## PROMPT 11 · INSPIRED REEL KA PREVIEW
**Kahan:** Code tab, naya session

```text
reels/karna-kavach folder mein meri awaaz, script.txt aur style.txt hain. cinematic-reel
skill aur style.txt follow karke reel banao: hamara 2.5D cinematic look rakho, par rang,
roshni, camera aur raftaar style card jaisi. Reference sirf style ke liye hai: unke
characters, drawing, logo, awaaz ya music bilkul copy mat karna, apne naye characters
banao. Environment settings mat badalna, zaroorat ho to bash setup.sh chalao.
Pehle scene plan dikhao, phir sirf 15 second ka preview banao, check.jpg dekh ke
galtiyan theek karo, commit + push karo aur batao preview kis branch mein kahan hai.
```

---
© 2026 "AI Se Cinematic Pauranik Reels". Sirf guide kharidne walon ke liye. Share ya resell karna mana hai (LICENSE dekho).
