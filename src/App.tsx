import { useState, ChangeEvent } from 'react';
import { 
  Shuffle, 
  RotateCcw, 
  X, 
  Users, 
  Check, 
  AlertTriangle, 
  School, 
  Info, 
  Sparkles, 
  HelpCircle,
  Undo
} from 'lucide-react';

export default function App() {
  // 학생 수 상태 (1 ~ 20명, 기본값 15명)
  const [studentCount, setStudentCount] = useState<number>(15);
  
  // 제외된 자리(X)의 인덱스 목록을 Set으로 관리 (0 ~ 19)
  const [blockedSeats, setBlockedSeats] = useState<Set<number>>(new Set());
  
  // 현재 각 자리에 배치된 학생 이름 배열 (크기 20)
  const [assignedSeats, setAssignedSeats] = useState<(string | null)[]>(Array(20).fill(null));
  
  // 자리 배정이 완료되었는지 여부
  const [isAssigned, setIsAssigned] = useState<boolean>(false);
  
  // 자리 섞는 애니메이션 진행 중 여부
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  // 배정 가능한 자리 수 계산 (전체 20자리 - 제외된 자리 수)
  const availableSeatsCount = 20 - blockedSeats.size;
  
  // 학생 수가 배정 가능 자리 수보다 많은지 체크 (오류 상태)
  const isOverloaded = studentCount > availableSeatsCount;

  // 인원수가 바뀔 때 혹은 제외된 자리가 바뀔 때, 배치 오류를 예방하기 위해 이전 배정을 초기화하는 로직
  // (단, X 표시 상태는 유지되어 선생님들의 편집 편의성을 높임)
  const handleStudentCountChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    setStudentCount(val);
    // 인원수 변경 시 배정 상태 초기화
    setAssignedSeats(Array(20).fill(null));
    setIsAssigned(false);
  };

  // 자리를 클릭했을 때 동작 (X 토글)
  const handleSeatClick = (index: number) => {
    if (isShuffling) return; // 섞는 중에는 클릭 차단

    setBlockedSeats((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });

    // 배치된 자리를 수정하면 직관적으로 배정을 초기화함
    setAssignedSeats(Array(20).fill(null));
    setIsAssigned(false);
  };

  // 피셔-예이츠 셔플 알고리즘을 사용한 무작위 배열 섞기
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // 자리 무작위 배정 실행 함수 (애니메이션 효과 포함)
  const handleAssignSeats = () => {
    if (isOverloaded || isShuffling) return;

    setIsShuffling(true);
    setIsAssigned(true);

    // 1. 학생 명단 생성 (학생 1, 학생 2, ...)
    const students = Array.from({ length: studentCount }, (_, i) => `학생 ${i + 1}`);
    
    // 2. 비어있고 선택 가능한 자리(X가 아닌 자리) 인덱스 필터링
    const freeIndices = Array.from({ length: 20 }, (_, i) => i)
      .filter(i => !blockedSeats.has(i));

    // 3. 역동적인 자리 변경 애니메이션 (셔플 효과) 구현
    let count = 0;
    const interval = setInterval(() => {
      // 매 프레임 임시로 셔플된 결과 생성
      const tempShuffled = shuffleArray(students);
      const tempAssignments = Array(20).fill(null);
      
      freeIndices.forEach((seatIndex, idx) => {
        if (idx < tempShuffled.length) {
          tempAssignments[seatIndex] = tempShuffled[idx];
        }
      });
      setAssignedSeats(tempAssignments);

      count++;
      // 약 0.5초 동안 빠르게 자리를 섞은 후 최종 배치 확정 (80ms * 6회 = 480ms)
      if (count >= 6) {
        clearInterval(interval);
        
        // 최종 무작위 셔플 배치 적용
        const finalShuffled = shuffleArray(students);
        const finalAssignments = Array(20).fill(null);
        
        freeIndices.forEach((seatIndex, idx) => {
          if (idx < finalShuffled.length) {
            finalAssignments[seatIndex] = finalShuffled[idx];
          }
        });
        
        setAssignedSeats(finalAssignments);
        setIsShuffling(false);
      }
    }, 80);
  };

  // 자리를 비우고 편집 모드로 돌아가기 (X 지정은 유지됨)
  const handleClearAssignments = () => {
    setAssignedSeats(Array(20).fill(null));
    setIsAssigned(false);
  };

  // 모든 설정 초기화 (학생 수 15명으로 복구, X 지정 전체 삭제, 배정 내역 삭제)
  const handleFullReset = () => {
    setStudentCount(15);
    setBlockedSeats(new Set());
    setAssignedSeats(Array(20).fill(null));
    setIsAssigned(false);
    setIsShuffling(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* 상단 네비게이션 헤더 */}
      <header className="bg-emerald-700 text-white shadow-md py-4 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <School className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 id="app-title" className="text-xl md:text-2xl font-bold tracking-tight">교실 자리 바꾸기 프로그램</h1>
              <p className="text-xs text-emerald-100 mt-0.5 font-medium">초보자 및 선생님을 위한 간편하고 공평한 무작위 배치 시스템</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>실행 중 메모리에만 안전하게 저장됨</span>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 왼쪽: 설정 및 작동 패널 (4/12 영역) */}
        <section className="lg:col-span-4 flex flex-col gap-5">
          
          {/* 1. 학생 인원수 설정 카드 */}
          <div id="settings-card" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-shadow hover:shadow-md">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              1. 학생 인원 설정
            </h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              자리 배치를 할 학생들의 총 인원수를 선택해 주세요. (1명~20명)
            </p>
            
            <div className="relative">
              <select
                id="student-count-select"
                value={studentCount}
                onChange={handleStudentCountChange}
                disabled={isShuffling}
                className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-lg font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer disabled:opacity-50"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}명 배정
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* 2. 배치 현황판 카드 */}
          <div id="status-card" className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-shadow hover:shadow-md">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span>
              현재 배치 현황
            </h2>
            
            <div className="grid grid-cols-1 gap-3.5 mb-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm text-slate-600 font-medium">전체 교실 자리</span>
                <span className="text-base font-bold text-slate-800">20자리</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <span className="text-sm text-indigo-900 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  배정할 학생 수
                </span>
                <span className="text-base font-bold text-indigo-700">{studentCount}명</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                <span className="text-sm text-red-900 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  지정된 빈자리 (X)
                </span>
                <span className="text-base font-bold text-red-600">{blockedSeats.size}개</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-sm text-emerald-900 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  실제 배치 가능 자리
                </span>
                <span className="text-base font-bold text-emerald-700">{availableSeatsCount}자리</span>
              </div>
            </div>

            {/* 경고 또는 성공 안내 배지 */}
            {isOverloaded ? (
              <div className="flex gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs leading-relaxed font-medium">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <span className="font-bold">배정 불가능! </span>
                  학생 수({studentCount}명)가 배치 가능 자리({availableSeatsCount}자리)보다 많습니다. 교실 배치도에서 빈자리(X) 지정을 일부 해제하여 자리를 확보해 주세요.
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold justify-center">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>자리 배정이 가능한 상태입니다.</span>
              </div>
            )}
          </div>

          {/* 3. 액션 실행 제어기 */}
          <div id="actions-card" className="flex flex-col gap-3">
            {!isAssigned ? (
              <button
                id="btn-assign-seats"
                onClick={handleAssignSeats}
                disabled={isOverloaded || isShuffling}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:scale-100 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-base"
              >
                <Shuffle className={`w-5 h-5 ${isShuffling ? 'animate-spin' : ''}`} />
                {isShuffling ? '자리를 임의로 섞는 중...' : '무작위 자리 배정 시작'}
              </button>
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <button
                  id="btn-reassign-seats"
                  onClick={handleAssignSeats}
                  disabled={isOverloaded || isShuffling}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-base"
                >
                  <Shuffle className={`w-5 h-5 ${isShuffling ? 'animate-spin' : ''}`} />
                  {isShuffling ? '자리를 임의로 섞는 중...' : '다시 자리 배정 (섞기)'}
                </button>
                
                <button
                  id="btn-clear-seats"
                  onClick={handleClearAssignments}
                  disabled={isShuffling}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Undo className="w-4 h-4" />
                  배정 비우기 (X 지정은 유지)
                </button>
              </div>
            )}

            <button
              id="btn-reset-all"
              onClick={handleFullReset}
              disabled={isShuffling}
              className="w-full bg-white hover:bg-slate-50 text-rose-600 border border-rose-200 hover:border-rose-300 font-semibold py-2.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              전체 초기화 (학생 수 및 X 해제)
            </button>
          </div>

          {/* 4. 사용 방법 안내 카드 */}
          <div id="guide-card" className="bg-slate-100 rounded-2xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-500" />
              💡 간단 사용 순서
            </h3>
            <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside pl-0.5 leading-relaxed font-medium">
              <li>상단에서 <span className="font-semibold text-slate-800">학생 인원수</span>를 선택합니다.</li>
              <li>우측 교실 배치도에서 미리 <span className="font-semibold text-slate-800">빈자리로 제외할 곳(X)</span>을 마우스로 클릭하여 지정합니다.</li>
              <li><span className="font-semibold text-emerald-700">무작위 자리 배정 시작</span> 버튼을 눌러 자리를 무작위로 배치합니다.</li>
              <li>결과가 마음에 들지 않으면 <span className="font-semibold text-emerald-700">다시 자리 배정</span> 버튼을 눌러 언제든지 다시 섞을 수 있습니다.</li>
            </ol>
          </div>

        </section>

        {/* 오른쪽: 교실 자리 배치도 및 교탁 (8/12 영역) */}
        <section id="classroom-section" className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 flex flex-col items-center">
          
          <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="text-xl">🏫</span>
              교실 자리 배치도 (4 × 5 구조)
            </h2>
            <div className="text-xs text-slate-400 font-medium">
              * 배정 전 자리를 클릭해 제외할 빈자리(X)를 지정하세요.
            </div>
          </div>

          {/* 교실 전면: 교탁 및 칠판 영역 */}
          <div id="classroom-front" className="w-full max-w-[200px] mb-8 relative">
            <div className="bg-slate-700 text-slate-100 text-xs font-bold py-2 px-6 rounded-lg shadow-inner text-center tracking-wider flex items-center justify-center gap-1.5 border-b-2 border-slate-900">
              <School className="w-4 h-4 text-emerald-300" />
              <span>교탁 / 칠판 (앞)</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-400 rounded-full mt-1"></div>
          </div>

          {/* 4행 × 5열 자리 그리드 */}
          <div id="seats-grid" className="w-full grid grid-cols-5 gap-3.5 max-w-3xl">
            {Array.from({ length: 20 }).map((_, index) => {
              const seatNo = index + 1;
              const isBlocked = blockedSeats.has(index);
              const assignedStudentName = assignedSeats[index];

              // 개별 카드의 동적 스타일링 결정
              let cardStyle = "";
              let statusLabel = "";

              if (isBlocked) {
                // 1. 빈자리 지정(X) 상태
                cardStyle = "bg-red-50/90 border-red-200 hover:bg-red-100/70 text-red-600 border-2";
                statusLabel = "빈자리 제외";
              } else if (isAssigned) {
                if (assignedStudentName) {
                  // 2. 학생이 배정된 상태
                  cardStyle = "bg-indigo-50 border-indigo-200 hover:border-indigo-300 text-indigo-900 shadow-sm border-2 font-bold transform hover:scale-[1.02]";
                } else {
                  // 3. 학생 수보다 남는 빈자리 상태
                  cardStyle = "bg-slate-50 border-slate-200 border text-slate-400 hover:bg-slate-100/50";
                  statusLabel = "빈자리";
                }
              } else {
                // 4. 배정 전 빈상태 (선택 가능 대기 상태)
                cardStyle = "bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 border cursor-pointer border-dashed hover:shadow-sm";
                statusLabel = "배정 대상";
              }

              return (
                <button
                  key={index}
                  id={`seat-card-${seatNo}`}
                  onClick={() => handleSeatClick(index)}
                  disabled={isShuffling}
                  className={`relative flex flex-col justify-between p-2 rounded-xl h-24 md:h-28 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 select-none ${cardStyle}`}
                  title={isBlocked ? "클릭하여 빈자리 지정 해제" : "클릭하여 무작위 배정에서 제외(X)"}
                >
                  {/* 자리 번호 및 토글 상태 표시 (좌측 상단) */}
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-[10px] md:text-xs font-bold ${
                      isBlocked ? 'text-red-400' : assignedStudentName ? 'text-indigo-400' : 'text-slate-400'
                    }`}>
                      {seatNo}번
                    </span>
                    
                    {/* Hover 상태에서 보여줄 힌트 및 현재 선택 상태 뱃지 */}
                    {!isAssigned && !isShuffling && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isBlocked 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity'
                      }`}>
                        {isBlocked ? '제외됨' : '제외하기'}
                      </span>
                    )}
                  </div>

                  {/* 카드 중앙 영역 */}
                  <div className="flex-1 flex flex-col items-center justify-center w-full">
                    {isBlocked ? (
                      // 제외된 자리 (X 표시)
                      <div className="flex flex-col items-center justify-center">
                        <X className="w-7 h-7 md:w-8 md:h-8 text-red-500 animate-fade-in stroke-[2.5]" />
                        <span className="text-[10px] md:text-xs font-bold text-red-400 mt-1">빈자리 지정</span>
                      </div>
                    ) : assignedStudentName ? (
                      // 학생 이름 표시
                      <div className="text-center">
                        <div className="text-sm md:text-base font-extrabold text-indigo-900 tracking-wide animate-fade-in">
                          {assignedStudentName}
                        </div>
                      </div>
                    ) : (
                      // 일반 빈자리 혹은 대기
                      <div className="text-center">
                        <span className="text-xs font-medium text-slate-400">
                          {statusLabel || '배정 대상'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 하단 장식/알림 바 */}
                  <div className="w-full flex justify-end">
                    {!isBlocked && assignedStudentName && (
                      <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-100/55 px-1 rounded">
                        배치완료
                      </span>
                    )}
                    {!isBlocked && !assignedStudentName && !isAssigned && (
                      <span className="text-[9px] font-semibold text-slate-400">
                        클릭 시 X
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 하단 안내 가이드 */}
          <div className="w-full max-w-3xl mt-6 p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/70 flex gap-2 text-xs text-emerald-800 font-medium leading-relaxed">
            <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">💡 선생님을 위한 유용한 팁</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>예를 들어 교실 앞쪽 한 자리를 완전히 비우고 싶을 경우, 자리배치 전에 해당 번호의 카드를 클릭하여 <span className="text-red-600 font-bold">X</span> 표시해 두시면 학생들이 그 자리에는 배치되지 않습니다.</li>
                <li>배치 완료 후에도 <span className="font-bold">X 표시를 유지한 상태로</span> 다시 자리 배정 버튼만 누르면, 기존에 지정한 빈자리를 제외한 남은 공간으로 학생들을 다시 섞습니다.</li>
              </ul>
            </div>
          </div>

        </section>

      </main>

      {/* 푸터 영역 */}
      <footer className="bg-slate-800 text-slate-400 text-center py-4 border-t border-slate-700 text-xs font-medium">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 교실 자리 바꾸기 프로그램 - 깔끔하고 직관적인 교사용 도구</span>
          <span>새로고침 시 모든 데이터가 완전 초기화됩니다.</span>
        </div>
      </footer>
    </div>
  );
}
