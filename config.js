/* ==========================================================
   🥝 여기만 바꾸면 돼요 (판매 정보 설정)
   ========================================================== */
const CONFIG = {
  // 가게 이름 (페이지 맨 위에 표시)
  SHOP_NAME: '못난이 키위 산지직송',
  SUBTITLE: '맛은 그대로, 가격은 착하게',

  // 구글 Apps Script 웹 앱 URL (README 2단계에서 복사한 주소)
  // 비워두면 '데모 모드'로 동작해요 (이 기기에만 임시 저장)
  API_URL: 'https://script.google.com/macros/s/AKfycbyZCCHV0xSTNKU2NcIz_TChvAHQR-h9ImkKySKMaLnRTaTGmXQBhYQ6kkDks5oGn17LzA/exec',

  // 상품 (가격을 바꾸면 apps-script/Code.gs 의 PRODUCTS 도 같이 바꿔주세요)
  PRODUCTS: [
    { id: '5kg',  label: '5kg',  kg: 5,  price: 35000 },
    { id: '10kg', label: '10kg', kg: 10, price: 55000, badge: '더 알뜰해요' },
  ],
  MAX_QTY: 10,

  // 카카오페이 송금 링크 (카카오페이 '송금코드'에서 복사, https://qr.kakaopay.com/... 형태)
  KAKAOPAY_LINK: 'https://qr.kakaopay.com/Ej7tWKir5',

  // 계좌이체 정보
  BANK: { name: '카카오뱅크', account: '3333039006031', holder: '한성태' },

  // 문의 연락처 (페이지 하단 표시)
  CONTACT: '010-2696-8002',

  // 파치 안내 문구
  NOTICE:
    '크기와 모양이 고르지 않은 파치(못난이) 키위를 저렴하게 보내드려요. ' +
    '맛과 신선도는 일반 상품과 같지만, 알 크기가 섞여 있거나 흠집·모양 차이가 있을 수 있어요. ' +
    '이 점은 교환·환불 사유가 되지 않는 점 양해 부탁드려요.',
};
