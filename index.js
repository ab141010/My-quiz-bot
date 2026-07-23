const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// 🔑 [중요] 여기에 본인의 실제 디스코드 봇 토큰을 넣어주세요!
const TOKEN = 'MTUyODY5NDYzMjE5ODgzMjI0MA.GSfpX_.Y0WURg9-IiFSZcajLykPAXecEOixmE6O77Z95k';

// 📚 퀴즈 문제 목록 (answers에 중복 정답들을 배열로 작성)
const quizList = [
    { question: '대한민국에서 가장 높은 산은 어디일까요?', answers: ['한라산', '한라산산'] },
    { question: '사과를 영어로 하면 무엇일까요?', answers: ['apple', 'Apple', '사과'] },
    { question: '1 + 1 은 무엇일까요?', answers: ['2', '이', 'two', 'Two'] },
    { question: '태양계에서 가장 큰 행성은 무엇일까요?', answers: ['목성', 'jupiter', 'Jupiter'] },
    { question: '한국의 수도는 어디일까요?', answers: ['서울', 'Seoul', 'seoul'] }
];

// 현재 진행 중인 퀴즈의 정답 배열을 저장할 변수
let currentAnswers = [];

// 🏆 유저별 점수 저장 객체
const userScores = {};

// 봇 로그인 성공 시
client.once('ready', () => {
    console.log(`✅ 로그인 성공! 봇 계정: ${client.user.tag}`);
});

// 👋 새 멤버가 서버에 들어왔을 때 자동 인사
client.on('guildMemberAdd', (member) => {
    const channel = member.guild.systemChannel || member.guild.channels.cache.find(ch => ch.isTextBased() && ch.permissionsFor(member.guild.members.me).has('SendMessages'));
    
    if (channel) {
        channel.send(`👋 안녕하세요 ${member}! 환영합니다. **공지사항을 읽어주세요!** 📢`);
    }
});

// 메시지 수신 이벤트
client.on('messageCreate', (message) => {
    if (message.author.bot) return; // 봇 메시지 무시

    const userId = message.author.id;
    const userName = message.author.displayName || message.author.username;

    // 1. "!퀴즈" - 랜덤 퀴즈 출제
    if (message.content === '!퀴즈') {
        const randomIndex = Math.floor(Math.random() * quizList.length);
        const randomQuiz = quizList[randomIndex];

        currentAnswers = randomQuiz.answers; // 여러 정답 목록 저장
        message.reply(`❓ **[랜덤 퀴즈]** ${randomQuiz.question}`);
    }

    // 2. "!점수판" - 내 점수만 확인
    else if (message.content === '!점수판') {
        const myScore = userScores[userId] ? userScores[userId].score : 0;
        message.reply(`👤 **${userName}**님의 현재 점수는 **${myScore}점**입니다! 🎯`);
    }

    // 3. "!리더보드" - 전체 순위 및 점수 확인
    else if (message.content === '!리더보드') {
        const userIds = Object.keys(userScores);

        if (userIds.length === 0) {
            return message.reply('📊 아직 등록된 점수가 없습니다. `!퀴즈`를 풀고 점수를 획득해 보세요!');
        }

        userIds.sort((a, b) => userScores[b].score - userScores[a].score);

        let leaderboardText = '🏆 **[ 퀴즈 전체 리더보드 ]** 🏆\n\n';
        userIds.forEach((id, index) => {
            const user = userScores[id];
            leaderboardText += `${index + 1}위. **${user.name}**: ${user.score}점\n`;
        });

        message.reply(leaderboardText);
    }

    // 4. 퀴즈 답변 검사 (중복 정답 체크)
    else if (currentAnswers.length > 0) {
        // 유저가 입력한 답이 정답 목록 중 하나라도 일치하면 성공!
        if (currentAnswers.includes(message.content.trim())) {
            if (!userScores[userId]) {
                userScores[userId] = { name: userName, score: 100 };
            } else {
                userScores[userId].score += 100;
                userScores[userId].name = userName;
            }

            message.reply(`🎉 **정답입니다!** (100점 획득! 🎯 현재 총점: **${userScores[userId].score}점**)`);
            currentAnswers = []; // 정답 맞췄으므로 초기화
        } 
        // 틀린 답을 입력한 경우
        else {
            message.reply(`❌ **틀렸습니다!** 대표 정답은 **[ ${currentAnswers[0]} ]** 입니다. 다시 \`!퀴즈\`를 입력해 보세요!`);
            currentAnswers = []; // 틀렸으므로 초기화
        }
    }
});

// 봇 로그인 실행
client.login(TOKEN);
