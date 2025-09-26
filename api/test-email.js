// Vercel API 엔드포인트: 테스트 이메일 발송
export default async function handler(req, res) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, keywords } = req.body;

        if (!email) {
            return res.status(400).json({ 
                success: false,
                error: '이메일 주소를 입력해주세요.' 
            });
        }

        // 이메일 유효성 검사
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                error: '올바른 이메일 주소를 입력해주세요.' 
            });
        }

        // 테스트 뉴스 데이터 생성
        const testNews = generateTestNews(keywords || [
            '정보보안', '정보보호', 'DN오토모티브', 
            'DN솔루션즈', '물리보안', '출입통제'
        ]);

        // 실제 환경에서는 nodemailer를 사용해 이메일 발송
        // 현재는 개발 환경이므로 시뮬레이션
        console.log(`테스트 이메일 발송 시뮬레이션: ${email}`);
        console.log('테스트 뉴스:', testNews);

        res.status(200).json({
            success: true,
            message: '테스트 이메일이 발송되었습니다.',
            newsCount: testNews.length
        });

    } catch (error) {
        console.error('테스트 이메일 발송 오류:', error);
        res.status(500).json({ 
            success: false,
            error: '이메일 발송 중 오류가 발생했습니다.' 
        });
    }
}

function generateTestNews(keywords) {
    const mockTitles = {
        '정보보안': [
            '2024년 사이버보안 위협 동향 분석',
            '새로운 랜섬웨어 변종 발견, 기업 주의 필요',
            'AI 기반 보안 솔루션 도입 확산'
        ],
        '정보보호': [
            '개인정보보호법 개정안 주요 내용 공개',
            'GDPR 준수를 위한 기업 대응 전략',
            '데이터 프라이버시 강화 방안 논의'
        ],
        'DN오토모티브': [
            'DN오토모티브, 전기차 부품 사업 확장',
            '친환경 자동차 기술 개발에 투자 확대',
            '글로벌 자동차 시장 진출 가속화'
        ],
        'DN솔루션즈': [
            'DN솔루션즈, 디지털 혁신 서비스 강화',
            'AI 솔루션 개발로 경쟁력 제고',
            '스마트팩토리 구축 프로젝트 수주'
        ],
        '물리보안': [
            '스마트 빌딩 물리보안 시스템 도입 확산',
            'CCTV AI 분석 기술 발전 현황',
            '출입통제 시스템 보안 강화 방안'
        ],
        '출입통제': [
            '생체인식 출입통제 시스템 도입 증가',
            'IoT 기반 스마트 도어락 보안 이슈',
            '무인 출입통제 시스템 기술 동향'
        ]
    };

    const news = [];
    
    keywords.forEach(keyword => {
        const titles = mockTitles[keyword] || [`${keyword} 관련 최신 뉴스`];
        const randomTitle = titles[Math.floor(Math.random() * titles.length)];
        
        news.push({
            title: randomTitle,
            summary: `${keyword}와 관련된 중요한 업데이트와 최신 동향을 다룬 뉴스입니다.`,
            url: '#',
            category: keyword,
            publishedAt: new Date().toISOString(),
            source: '뉴스 클리핑 테스트'
        });
    });

    return news;
}