export const formatDate = (date) => {
  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${months[date.getMonth()]} ${date.getDate()}일 ${days[date.getDay()]}`;
};

export const getMoodText = (mood) => {
  const moodMap = {
    '😐': '그냥저냥',
    '😠': '화나요',
    '😊': '좋아요',
    '😢': '슬퍼요',
    '🤩': '신나요'
  };
  return moodMap[mood] || mood;
};
