// Vercel API 엔드포인트: 키워드 관리
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

    try {
        switch (req.method) {
            case 'GET':
                return handleGet(req, res);
            case 'POST':
                return handlePost(req, res);
            case 'PUT':
                return handlePut(req, res);
            case 'DELETE':
                return handleDelete(req, res);
            default:
                res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// 키워드 목록 조회
async function handleGet(req, res) {
    // 실제 환경에서는 데이터베이스나 저장소에서 읽어옴
    const defaultKeywords = [
        '정보보안',
        '정보보호',
        'DN오토모티브',
        'DN솔루션즈',
        '물리보안',
        '출입통제'
    ];
    
    res.status(200).json({
        success: true,
        keywords: defaultKeywords,
        lastUpdated: new Date().toISOString()
    });
}

// 키워드 추가
async function handlePost(req, res) {
    const { keyword } = req.body;
    
    if (!keyword || typeof keyword !== 'string') {
        return res.status(400).json({ 
            success: false,
            error: '키워드를 입력해주세요.' 
        });
    }

    const trimmedKeyword = keyword.trim();
    
    if (trimmedKeyword.length === 0) {
        return res.status(400).json({ 
            success: false,
            error: '빈 키워드는 추가할 수 없습니다.' 
        });
    }

    if (trimmedKeyword.length > 50) {
        return res.status(400).json({ 
            success: false,
            error: '키워드는 50자 이내로 입력해주세요.' 
        });
    }

    // 실제 환경에서는 데이터베이스에 저장
    res.status(201).json({
        success: true,
        message: '키워드가 추가되었습니다.',
        keyword: trimmedKeyword
    });
}

// 키워드 목록 업데이트
async function handlePut(req, res) {
    const { keywords } = req.body;
    
    if (!Array.isArray(keywords)) {
        return res.status(400).json({ 
            success: false,
            error: '키워드 목록이 올바르지 않습니다.' 
        });
    }

    // 키워드 유효성 검사
    for (const keyword of keywords) {
        if (typeof keyword !== 'string' || keyword.trim().length === 0) {
            return res.status(400).json({ 
                success: false,
                error: '모든 키워드는 유효한 문자열이어야 합니다.' 
            });
        }
        
        if (keyword.length > 50) {
            return res.status(400).json({ 
                success: false,
                error: '키워드는 50자 이내여야 합니다.' 
            });
        }
    }

    // 실제 환경에서는 데이터베이스에 저장
    res.status(200).json({
        success: true,
        message: '키워드 목록이 업데이트되었습니다.',
        keywords: keywords.map(k => k.trim())
    });
}

// 키워드 삭제
async function handleDelete(req, res) {
    const { keyword } = req.query;
    
    if (!keyword) {
        return res.status(400).json({ 
            success: false,
            error: '삭제할 키워드를 지정해주세요.' 
        });
    }

    // 실제 환경에서는 데이터베이스에서 삭제
    res.status(200).json({
        success: true,
        message: '키워드가 삭제되었습니다.',
        keyword: keyword
    });
}