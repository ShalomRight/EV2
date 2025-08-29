
import React, { useState, useEffect, useRef } from 'react';
import { 
    Camera, Heart, Star, MapPin, Calendar, Users, Search, Menu, X, Play, 
    MessageCircle, Share2, User, Settings, LogOut, ChevronRight, Clock, Award, Zap, 
    Trophy, Gift, Bell, Home, Grid, ShoppingBag, Tv, MoreVertical, Bookmark, Filter, CheckCircle, Info, Image as ImageIcon, Navigation, HelpCircle, UserPlus, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockUser, mockFeedData, mockVendors, mockEvents } from './constants';
import { User as UserType, FeedItem, Vendor, Event, View, VendorCategory, FeedItemType, Review, Product } from './types';


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(mockUser);
  
  // --- Navigation State ---
  const [history, setHistory] = useState<View[]>(['home']);
  const currentView = history[history.length - 1];
  
  // --- Detail View State ---
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{product: Product, vendor: Vendor} | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<FeedItem | null>(null);
  
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [kioskMode, setKioskMode] = useState(false);
  const [kioskIndex, setKioskIndex] = useState(0);

  // New state for user's poll/quiz answers and scores
  const [activityState, setActivityState] = useState<{ [id: string]: { answeredOption?: string; score?: number; completed?: boolean } }>({});


  // --- Handlers ---
  const handleLogin = (email, password, role = 'user') => {
    setCurrentUser({ ...mockUser, role: role as UserType['role'] });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setHistory(['home']);
    setShowMenu(false);
  };

  const navigateTo = (view: View, data: any = null) => {
    window.scrollTo(0, 0);
    if (view === 'vendor-detail' && data) setSelectedVendor(data);
    if (view === 'event-detail' && data) setSelectedEvent(data);
    if (view === 'product-detail' && data) setSelectedProduct(data);
    if (view === 'activity-detail' && data) setSelectedActivity(data);
    
    setHistory(prev => [...prev, view]);
    setShowMenu(false);
  };

  const handleBack = () => {
    if (history.length > 1) {
        setHistory(prev => prev.slice(0, -1));
    }
  };
  
  const handleToggleSave = (itemId: string) => {
    if (!currentUser) return;
    const isSaved = currentUser.savedItems.includes(itemId);
    if (isSaved) return; // For activities, we only add, not toggle
    const updatedSavedItems = [...currentUser.savedItems, itemId];
    setCurrentUser({ ...currentUser, savedItems: updatedSavedItems });
  };
  
  const handleToggleLike = (itemId: string) => {
    if (!currentUser) return;
    const isLiked = currentUser.likedItems.includes(itemId);
    const updatedLikedItems = isLiked 
      ? currentUser.likedItems.filter(id => id !== itemId)
      : [...currentUser.likedItems, itemId];
    setCurrentUser({ ...currentUser, likedItems: updatedLikedItems });
  };

  // --- Components ---

  const Header: React.FC<{ title: string; actions?: { icon: React.ReactNode; onClick: () => void; }[]; }> = ({ title, actions = [] }) => (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        {history.length > 1 ? (<button onClick={handleBack} className="p-2 -ml-2 text-gray-700"><ChevronRight size={24} className="transform rotate-180" /></button>) : (<button onClick={() => setShowMenu(true)} className="p-2 -ml-2 text-gray-700"><Menu size={24} /></button>)}
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>
      <div className="flex items-center space-x-2">
        {actions.map((action, index) => (<button key={index} onClick={action.onClick} className="p-2 text-gray-600 hover:text-green-600">{action.icon}</button>))}
      </div>
    </header>
  );

  const NavigationDrawer: React.FC = () => (
    <AnimatePresence>
    {showMenu && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50" onClick={() => setShowMenu(false)} />
        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-xl">
           <div className="p-4 border-b">
              <h2 className="text-xl font-bold">Menu</h2>
           </div>
           <nav className="p-4 space-y-2">
                <button onClick={() => navigateTo('map')} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-left"><MapPin className="text-gray-500" /><span>Maps / Locations</span></button>
                <button onClick={() => navigateTo('all-activities')} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-left"><Grid className="text-gray-500" /><span>All Activities</span></button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-left"><Settings className="text-gray-500" /><span>Settings</span></button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 text-left"><HelpCircle className="text-gray-500" /><span>Help & Support</span></button>
           </nav>
           <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
               <button onClick={handleLogout} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 text-left"><LogOut /><span>Sign Out</span></button>
           </div>
        </motion.div>
      </motion.div>
    )}
    </AnimatePresence>
  );

  const HomeCarousel: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselItems = mockFeedData.slice(0, 4);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % carouselItems.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [carouselItems.length]);

    const currentItem = carouselItems[currentIndex];

    return (
        <div className="h-[50vh] relative rounded-2xl overflow-hidden mb-6 shadow-lg">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <img src={currentItem.media} alt={currentItem.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2 line-clamp-2">{currentItem.title}</h2>
                        <div className="flex items-center space-x-3">
                            <img src={currentItem.authorAvatar} alt={currentItem.author} className="w-8 h-8 rounded-full border-2 border-white" />
                            <div>
                                <p className="font-semibold text-sm">{currentItem.author}</p>
                                <p className="text-xs opacity-80">{currentItem.timestamp}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {carouselItems.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
                ))}
            </div>
        </div>
    );
  };
  
  const HomeView: React.FC = () => (
    <div>
      <Header title="Everything Vincy" actions={[{ icon: <Search size={20} />, onClick: () => {} }, { icon: <Bell size={20} />, onClick: () => {} }]} />
      <div className="p-4">
        <HomeCarousel />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 mb-6 shadow-md border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {currentUser?.name.split(' ')[0]}! 🇻🇨</h2>
          <p className="text-gray-600">Keep engaging with the community to earn more points and rewards.</p>
        </motion.div>
        
        <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigateTo('vendors')} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-left hover:border-green-500 transition-colors"><div className="text-2xl mb-2 text-green-600"><ShoppingBag/></div><h3 className="font-semibold text-gray-800">Browse Vendors</h3><p className="text-sm text-gray-500">Local businesses</p></motion.button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigateTo('events')} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-left hover:border-green-500 transition-colors"><div className="text-2xl mb-2 text-green-600"><Calendar/></div><h3 className="font-semibold text-gray-800">Upcoming Events</h3><p className="text-sm text-gray-500">Don't miss out</p></motion.button>
            </div>
        </div>
      </div>
    </div>
  );

  const FeedCard: React.FC<{ item: FeedItem; isSaved: boolean; isLiked: boolean; onToggleSave: (id: string) => void; onToggleLike: (id: string) => void; }> = ({ item, isSaved, isLiked, onToggleSave, onToggleLike }) => {
    const isActivity = item.type === FeedItemType.Poll || item.type === FeedItemType.Quiz;
    const cardContent = (
      <>
        <div className="p-4 flex items-center space-x-3">
            <img src={item.authorAvatar} alt={item.author} className="w-11 h-11 rounded-full" />
            <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-gray-800">{item.author}</h4>
                  { item.type === FeedItemType.VendorHighlight && <CheckCircle size={16} className="text-yellow-500 fill-current"/> }
                </div>
                <p className="text-sm text-gray-500">{item.timestamp}</p>
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-800"><MoreVertical size={20} /></button>
        </div>

        {item.title && <h3 className="font-bold text-lg px-4">{item.title}</h3>}
        {item.caption && <p className="px-4 pt-1 pb-3 text-gray-700">{item.caption}</p>}
        
        {item.media && (
            <div className="relative bg-gray-100">
                <img src={item.media} alt={item.title} className="w-full max-h-[60vh] object-cover" />
                { item.type === FeedItemType.Video && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><button className="bg-white/80 rounded-full p-4"><Play size={32} className="text-gray-800 fill-current ml-1"/></button></div>}
            </div>
        )}
        
        {isActivity && <div className="px-4 pb-4"><div className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold text-center hover:bg-green-700 transition-colors">View Activity</div></div> }

        <div className="px-4 py-2 flex items-center justify-between border-t border-gray-100">
            <div className="flex items-center space-x-4">
                <button onClick={() => onToggleLike(item.id)} className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}><Heart size={20} className={isLiked ? 'fill-current': ''}/> <span className="text-sm font-semibold">{item.likes + (isLiked && !mockUser.likedItems.includes(item.id) ? 1 : 0)}</span></button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"><MessageCircle size={20} /> <span className="text-sm font-semibold">{item.comments}</span></button>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors"><Share2 size={20} /> <span className="text-sm font-semibold">{item.shares}</span></button>
            </div>
            <button onClick={() => onToggleSave(item.id)} className={`p-2 rounded-full ${isSaved ? 'text-green-600 bg-green-100' : 'text-gray-500 hover:bg-gray-100'}`}><Bookmark size={20} className={isSaved ? 'fill-current':''} /></button>
        </div>
      </>
    );

    return (
        <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          { isActivity 
            ? <button className="w-full text-left" onClick={() => navigateTo('activity-detail', item)}>{cardContent}</button>
            : <div>{cardContent}</div>
          }
        </motion.div>
    );
  };

  const FeedView: React.FC<{defaultTab?: string}> = ({defaultTab = 'Posts'}) => {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const tabs = ['Posts', 'Videos', 'Activities'];
    
    const filteredFeed = mockFeedData.filter(item => {
      if (activeTab === 'Posts') return true;
      if (activeTab === 'Videos') return item.type === FeedItemType.Video;
      if (activeTab === 'Activities') return item.type === FeedItemType.Poll || item.type === FeedItemType.Quiz;
      return false;
    });

    return (
      <div>
        <Header title="Community" actions={[{ icon: <Filter size={20} />, onClick: () => {} }, { icon: <div className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-green-700">Post</div>, onClick: () => {}}]} />
        <div className="p-4 sticky top-[61px] bg-gray-50 z-20">
            <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 flex items-center space-x-1">
                {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full py-2 px-3 text-sm font-semibold rounded-full transition-colors ${activeTab === tab ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{tab}</button>
                ))}
            </div>
        </div>
        <div className="p-4 space-y-4">
            <AnimatePresence>
                {filteredFeed.map(item => (
                    <FeedCard key={item.id} item={item} 
                      isSaved={currentUser?.savedItems.includes(item.id) || false} 
                      isLiked={currentUser?.likedItems.includes(item.id) || false}
                      onToggleSave={handleToggleSave}
                      onToggleLike={handleToggleLike}
                    />
                ))}
            </AnimatePresence>
            <button className="w-full bg-white py-3 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm">Load More Posts</button>
        </div>
      </div>
    );
  };
  
  const ActivityDetailView: React.FC = () => {
    if (!selectedActivity) return null;

    const isCompleted = activityState[selectedActivity.id]?.completed;

    // --- Poll Component ---
    const PollComponent = () => {
        const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
        
        const handleSubmit = () => {
            if (!selectedOptionId) return;
            setActivityState(prev => ({ ...prev, [selectedActivity.id]: { completed: true, answeredOption: selectedOptionId } }));
            if (currentUser && !currentUser.savedItems.includes(selectedActivity.id)) {
                handleToggleSave(selectedActivity.id);
            }
        };

        if(isCompleted) {
            const totalVotes = selectedActivity.pollOptions!.reduce((sum, opt) => sum + opt.votes, 0);
            return (
                <div className="space-y-3">
                    {selectedActivity.pollOptions!.map(option => {
                        const isSelected = activityState[selectedActivity.id]?.answeredOption === option.id;
                        const votes = option.votes + (isSelected ? 1 : 0);
                        const percentage = totalVotes > 0 ? ((votes / (totalVotes + 1)) * 100).toFixed(0) : 0;
                        return (
                            <div key={option.id} className={`p-4 rounded-lg border-2 ${isSelected ? 'border-green-500' : 'border-gray-200'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold">{option.text}</span>
                                    <span className="font-bold">{percentage}%</span>
                                </div>
                                <div className="bg-gray-200 rounded-full h-2.5">
                                    <motion.div initial={{width: 0}} animate={{width: `${percentage}%`}} className="bg-green-500 h-2.5 rounded-full" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{votes.toLocaleString()} votes</p>
                            </div>
                        )
                    })}
                </div>
            )
        }

        return (
            <div className="space-y-3">
                {selectedActivity.pollOptions!.map(option => (
                    <button key={option.id} onClick={() => setSelectedOptionId(option.id)} className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${selectedOptionId === option.id ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                        <span className="font-semibold">{option.text}</span>
                    </button>
                ))}
                <button onClick={handleSubmit} disabled={!selectedOptionId} className="w-full bg-green-600 text-white py-3 rounded-lg text-sm font-semibold disabled:bg-gray-300 transition-colors">Submit Vote</button>
            </div>
        );
    };
    
    // --- Quiz Component ---
    const QuizComponent = () => {
      const quiz = selectedActivity.quiz!;
      const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
      const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
      const [timeLeft, setTimeLeft] = useState(20);

      useEffect(() => {
        if (isCompleted) return;
        const timer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              handleNext();
              return 20;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }, [currentQuestionIndex, isCompleted]);
      
      const handleAnswerSelect = (optionId: string) => {
        setUserAnswers(prev => ({...prev, [currentQuestionIndex]: optionId}));
      };

      const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setTimeLeft(20);
        } else {
            // End of quiz
            let score = 0;
            quiz.questions.forEach((q, index) => {
                if (q.correctAnswerId === userAnswers[index]) {
                    score++;
                }
            });
            setActivityState(prev => ({...prev, [selectedActivity.id]: { completed: true, score }}));
            if (currentUser && !currentUser.savedItems.includes(selectedActivity.id)) {
                handleToggleSave(selectedActivity.id);
            }
        }
      };

      if (isCompleted) {
        const score = activityState[selectedActivity.id]?.score || 0;
        const total = quiz.questions.length;
        return (
            <div className="text-center p-6">
                <h3 className="text-2xl font-bold mb-2">Quiz Completed!</h3>
                <p className="text-gray-600 mb-4">You did a great job.</p>
                <p className="text-5xl font-bold text-green-600 mb-4">{score} / {total}</p>
                <p className="text-lg font-semibold">Correct Answers</p>
            </div>
        );
      }
      
      const currentQuestion = quiz.questions[currentQuestionIndex];
      const selectedOptionId = userAnswers[currentQuestionIndex];

      return (
        <div>
           <div className="flex justify-between items-center mb-4 text-sm font-semibold">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">0 Points</span>
                <span className="flex items-center space-x-1 text-gray-500"><Timer size={16}/><span>{timeLeft}s</span></span>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-4">
                  <span className="text-xs font-semibold bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">Geography</span>
                  <span className="text-xs font-semibold text-green-700 ml-2">Easy • 10 Pts</span>
                </div>
                <h3 className="text-xl font-bold mb-6 text-gray-800">{currentQuestion.question}</h3>
                <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, index) => (
                        <button key={option.id} onClick={() => handleAnswerSelect(option.id)} className={`w-full flex items-center space-x-4 text-left p-4 rounded-lg border-2 transition-colors ${selectedOptionId === option.id ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}>
                            <div className={`w-6 h-6 rounded-md text-sm font-bold flex items-center justify-center ${selectedOptionId === option.id ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                {String.fromCharCode(65 + index)}
                            </div>
                            <span className="font-semibold text-gray-700">{option.text}</span>
                        </button>
                    ))}
                </div>
                <button onClick={handleNext} disabled={!selectedOptionId} className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold disabled:bg-gray-300 transition-colors hover:bg-green-600">
                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Submit Answer'}
                </button>
            </div>
        </div>
      );
    };

    return (
        <div>
            <Header title={selectedActivity.type === 'poll' ? "Poll" : "Quiz"} />
            <div className="p-4 space-y-4">
                <FeedCard item={selectedActivity}
                    isSaved={currentUser?.savedItems.includes(selectedActivity.id) || false}
                    isLiked={currentUser?.likedItems.includes(selectedActivity.id) || false}
                    onToggleSave={() => {}} // Save is handled by interaction
                    onToggleLike={handleToggleLike}
                />
                <div className="bg-gray-50 rounded-2xl p-4">
                    {selectedActivity.type === FeedItemType.Poll && <PollComponent />}
                    {selectedActivity.type === FeedItemType.Quiz && <QuizComponent />}
                </div>
            </div>
        </div>
    );
  };
  
  const VendorsView: React.FC = () => {
      const [filter, setFilter] = useState<VendorCategory | 'All'>('All');
      const filteredVendors = mockVendors.filter(v => filter === 'All' || v.category === filter);

      return (
        <div>
            <Header title="Local Vendors" />
            <div className="p-4 space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search vendors..." className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"/>
                </div>
                 <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select value={filter} onChange={e => setFilter(e.target.value as VendorCategory | 'All')} className="w-full appearance-none pl-12 pr-4 py-3 rounded-full bg-white border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="All">All Categories</option>
                        {Object.values(VendorCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-800 my-4">Featured Vendors</h3>
                    <div className="space-y-4">{mockVendors.filter(v => v.featured).map(vendor => (
                      <motion.div key={vendor.id} whileTap={{ scale: 0.98 }} onClick={() => navigateTo('vendor-detail', vendor)} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 cursor-pointer">
                          <div className="relative h-48">
                              <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover"/>
                              <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">Featured</div>
                              {vendor.premium && <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">Premium</div>}
                          </div>
                          <div className="p-4">
                              <h4 className="font-bold text-lg text-gray-800">{vendor.name}</h4>
                              <p className="text-green-600 text-sm font-semibold mb-2">{vendor.category}</p>
                              <div className="flex items-center text-sm text-gray-600">
                                  <Star size={16} className="text-yellow-500 fill-yellow-500 mr-1"/>
                                  <span className="font-bold">{vendor.rating}</span>
                                  <span className="ml-1">({vendor.reviewsCount} reviews)</span>
                              </div>
                          </div>
                      </motion.div>
                    ))}</div>
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-800 my-4">{filter === 'All' ? 'All Vendors' : filter}</h3>
                     <div className="space-y-3">{filteredVendors.map(vendor => (
                      <motion.div key={vendor.id} whileTap={{ scale: 0.98 }} onClick={() => navigateTo('vendor-detail', vendor)} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 cursor-pointer flex items-center space-x-4">
                          <img src={vendor.image} alt={vendor.name} className="w-20 h-20 rounded-lg object-cover" />
                          <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{vendor.name}</h4>
                              <p className="text-green-600 text-sm">{vendor.category}</p>
                              <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium">{vendor.rating}</span>
                              </div>
                          </div>
                          <ChevronRight size={20} className="text-gray-400" />
                      </motion.div>
                     ))}</div>
                </div>
            </div>
        </div>
      )
  };

  const VendorDetailView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Showcase');
    if (!selectedVendor) return null;
    
    const tabs = ['Showcase', 'Gallery', 'Reviews', 'Info'];

    const ProductCard: React.FC<{product: Product, vendor: Vendor}> = ({product, vendor}) => (
        <button onClick={() => navigateTo('product-detail', {product, vendor})} className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm w-full text-left">
            <img src={product.image} alt={product.name} className="w-full h-32 object-cover" />
            <div className="p-3">
                <h5 className="font-semibold text-sm text-gray-800 truncate">{product.name}</h5>
                {product.price && <p className="text-green-600 font-bold text-sm mt-1">{product.price}</p>}
            </div>
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'Showcase':
                return <div className="grid grid-cols-2 gap-4">
                    {selectedVendor.products.length > 0 ? selectedVendor.products.map(product => (
                        <ProductCard key={product.id} product={product} vendor={selectedVendor} />
                    )) : <p className="col-span-2 text-center text-gray-500">No products to showcase.</p>}
                </div>;
            case 'Gallery':
                return <div className="grid grid-cols-2 gap-2">
                    {selectedVendor.showcaseImages.map(img => <img key={img} src={img} className="rounded-lg w-full h-32 object-cover" />)}
                </div>;
            case 'Reviews':
                return <div className="space-y-4">
                    {selectedVendor.reviews.map(review => (
                        <div key={review.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center space-x-3 mb-2">
                                <img src={review.avatar} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-semibold text-gray-800">{review.author}</p>
                                    <p className="text-xs text-gray-500">{review.timestamp}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-1 mb-2">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'} />)}
                            </div>
                            <p className="text-gray-700 text-sm">{review.comment}</p>
                        </div>
                    ))}
                </div>;
            case 'Info':
                return <div className="space-y-4 text-gray-700">
                    <p>{selectedVendor.description}</p>
                    <div className="flex items-center space-x-2"><MapPin size={16} /><p> {selectedVendor.location}</p></div>
                    <div className="flex items-center space-x-2"><Clock size={16} /><p> Mon-Sat: 8AM-6PM, Sun: 10AM-4PM</p></div>
                    <div className="flex items-center space-x-2"><Users size={16} /><p> {selectedVendor.followersCount.toLocaleString()} followers</p></div>

                </div>;
            default: return null;
        }
    }

    return (
        <div>
            <Header title={selectedVendor.name} />
            <div>
                <img src={selectedVendor.image} alt={selectedVendor.name} className="w-full h-56 object-cover" />
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                           <h1 className="text-3xl font-bold text-gray-800">{selectedVendor.name}</h1>
                           <p className="text-green-600 font-semibold">{selectedVendor.category}</p>
                        </div>
                        <div className="flex space-x-2">
                           <button className="p-3 bg-white rounded-full shadow border"><UserPlus size={20}/></button>
                           <button className="p-3 bg-white rounded-full shadow border"><Share2 size={20}/></button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-1 my-4">
                        <Star size={18} className="text-yellow-500 fill-current" />
                        <span className="font-bold text-gray-800">{selectedVendor.rating}</span>
                        <span className="text-sm text-gray-600">({selectedVendor.reviewsCount} reviews)</span>
                        <span className="text-gray-300 mx-2">|</span>
                        <MapPin size={16} className="text-gray-500"/>
                        <span className="text-sm text-gray-600">{selectedVendor.location}</span>
                    </div>
                    <button className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors">Contact Vendor</button>
                </div>
                 <div className="px-4 border-b border-gray-200">
                    <div className="flex items-center -mb-px">
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>{tab}</button>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-gray-50">{renderContent()}</div>
            </div>
        </div>
    );
  };
  
  const ProductDetailView: React.FC = () => {
    if (!selectedProduct) return null;
    const { product, vendor } = selectedProduct;
    return (
        <div>
            <Header title={product.name} />
            <div className="p-4 space-y-4">
                <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
                    <img src={product.image} alt={product.name} className="w-full h-64 object-cover" />
                    <div className="p-4">
                        <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
                        {product.price && <p className="text-2xl font-bold text-green-600 my-2">{product.price}</p>}
                        <p className="text-gray-600 mt-2">{product.description}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-2 text-gray-800">Sold by</h3>
                    <div onClick={() => navigateTo('vendor-detail', vendor)} className="cursor-pointer flex items-center space-x-3">
                        <img src={vendor.image} alt={vendor.name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                            <p className="font-semibold text-gray-800">{vendor.name}</p>
                            <p className="text-sm text-green-600">{vendor.category}</p>
                        </div>
                    </div>
                </div>
                <button className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors">Inquire Now</button>
            </div>
        </div>
    );
  }
  
  const EventsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const featuredEvent = mockEvents.find(e => e.featured && new Date(e.date) >= new Date());
    const otherEvents = mockEvents.filter(e => e.id !== featuredEvent?.id);
    const today = new Date();
    today.setHours(0,0,0,0);

    const upcomingEvents = otherEvents.filter(e => new Date(e.date) >= today);
    const pastEvents = otherEvents.filter(e => new Date(e.date) < today);
    const eventsToShow = activeTab === 'Upcoming' ? upcomingEvents : pastEvents;

    return (
        <div>
            <Header title="Events" />
            <div className="p-4 space-y-6">
                {featuredEvent && (
                    <motion.div whileTap={{ scale: 0.98 }} onClick={() => navigateTo('event-detail', featuredEvent)} className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer">
                        <div className="relative">
                            <img src={featuredEvent.image} alt={featuredEvent.title} className="w-full h-56 object-cover" />
                            <p className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold z-10">Featured Event</p>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-xl text-gray-800">{featuredEvent.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{new Date(featuredEvent.date).toDateString()} at {featuredEvent.time}</p>
                        </div>
                    </motion.div>
                )}
                 <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 flex items-center space-x-1">
                    <button onClick={() => setActiveTab('Upcoming')} className={`w-full py-2 px-3 text-sm font-semibold rounded-full transition-colors ${activeTab === 'Upcoming' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Upcoming</button>
                    <button onClick={() => setActiveTab('Past')} className={`w-full py-2 px-3 text-sm font-semibold rounded-full transition-colors ${activeTab === 'Past' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Past</button>
                </div>
                <div className="space-y-4">
                    {eventsToShow.map(event => (
                        <motion.div key={event.id} whileTap={{ scale: 0.98 }} onClick={() => navigateTo('event-detail', event)} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 cursor-pointer flex items-center space-x-4">
                            <img src={event.image} alt={event.title} className="w-20 h-20 rounded-lg object-cover" />
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">{event.title}</h4>
                                <p className="text-sm text-gray-500">{new Date(event.date).toDateString()}</p>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
  };
  
  const EventDetailView: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Info');
    if (!selectedEvent) return null;
    
    const tabs = ['Info', 'Showcase', 'Vendors', 'Map'];

     const renderContent = () => {
        switch (activeTab) {
            case 'Info':
                return <div className="space-y-4 text-gray-700">
                    <p>{selectedEvent.description}</p>
                    <div className="flex items-center space-x-2"><Calendar size={16} /><p>{new Date(selectedEvent.date).toDateString()} at {selectedEvent.time}</p></div>
                    <div className="flex items-center space-x-2"><MapPin size={16} /><p>{selectedEvent.location}</p></div>
                    <div className="flex items-center space-x-2"><Users size={16} /><p>{selectedEvent.attendees} people attending</p></div>
                </div>;
            case 'Showcase':
                 return <div className="grid grid-cols-2 gap-2">
                    {selectedEvent.showcaseImages?.map(img => <img key={img} src={img} className="rounded-lg w-full h-32 object-cover" />) || <p>No images to show.</p>}
                </div>;
            case 'Vendors':
                return <div className="space-y-3">
                    {selectedEvent.participants?.map(vendor => (
                      <div key={vendor.id} onClick={() => navigateTo('vendor-detail', mockVendors.find(v => v.id === vendor.id))} className="bg-gray-50 rounded-xl p-3 cursor-pointer flex items-center space-x-4">
                          <img src={vendor.image} alt={vendor.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{vendor.name}</h4>
                              <p className="text-green-600 text-sm">{vendor.category}</p>
                          </div>
                      </div>
                    )) || <p>No participating vendors listed.</p>}
                </div>;
            case 'Map':
                return <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">Map Placeholder</div>;

            default: return null;
        }
    }

    return (
        <div>
            <Header title={selectedEvent.title} />
            <img src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-56 object-cover" />
            <div className="p-4">
                <h1 className="text-3xl font-bold text-gray-800">{selectedEvent.title}</h1>
                <p className="text-blue-600 font-semibold my-2">{selectedEvent.category}</p>
                <div className="text-sm text-gray-600 flex items-center space-x-4">
                    <div className="flex items-center space-x-1"><Calendar size={14}/><span>{new Date(selectedEvent.date).toDateString()}</span></div>
                    <div className="flex items-center space-x-1"><MapPin size={14}/><span>{selectedEvent.location}</span></div>
                </div>
            </div>
            <div className="px-4 border-b border-gray-200">
                <div className="flex items-center -mb-px">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>{tab}</button>
                    ))}
                </div>
            </div>
            <div className="p-4">{renderContent()}</div>
        </div>
    );
  };
  
  const DashboardView: React.FC = () => {
    if (!currentUser) return null;
    const [activeTab, setActiveTab] = useState('Overview');
    const tabs = ['Overview', 'Engagements', 'Following'];
    
    const engagementIds = new Set([...currentUser.savedItems, ...currentUser.likedItems]);
    const engagementItems = mockFeedData.filter(item => engagementIds.has(item.id));
    const followingVendors = mockVendors.filter(vendor => currentUser.following.includes(vendor.id));

    const renderContent = () => {
        switch(activeTab) {
            case 'Overview':
                return <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-sm text-gray-500">Total Points</p>
                            <p className="text-3xl font-bold text-gray-800 flex items-center space-x-1"><Zap size={24} className="text-yellow-500" /> <span>{currentUser.points}</span></p>
                            <p className="text-xs text-gray-500">250 to next level</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Current Level</p>
                            <p className="text-3xl font-bold text-gray-800 flex items-center space-x-1"><Trophy size={24} className="text-amber-500" /> <span>Level {currentUser.level}</span></p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2"><div className="bg-green-500 h-1.5 rounded-full" style={{width: '75%'}}></div></div>
                        </div>
                    </div>
                     <div>
                        <h3 className="font-bold text-lg mb-2 text-gray-800">Your Badges</h3>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                        {currentUser.badges.map(badge => (
                            <div key={badge} className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-full"><Award size={20} className="text-green-600"/></div>
                                <div>
                                  <p className="font-semibold text-gray-700">{badge}</p>
                                  <p className="text-xs text-gray-500">Achievement unlocked</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>;
            case 'Engagements':
                 return <div className="space-y-4">
                    {engagementItems.length > 0 ? engagementItems.map(item => (
                        <FeedCard key={item.id} item={item} 
                          isSaved={currentUser.savedItems.includes(item.id)}
                          isLiked={currentUser.likedItems.includes(item.id)}
                          onToggleSave={handleToggleSave} onToggleLike={handleToggleLike} />
                    )) : <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"><p className="text-center text-gray-500">You haven't engaged with any items yet.</p></div>}
                </div>;
            case 'Following':
                 return <div className="space-y-3">{followingVendors.map(vendor => (
                  <div key={vendor.id} onClick={() => navigateTo('vendor-detail', vendor)} className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 cursor-pointer flex items-center space-x-4">
                      <img src={vendor.image} alt={vendor.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{vendor.name}</h4>
                          <p className="text-green-600 text-sm">{vendor.category}</p>
                      </div>
                  </div>
                 ))}</div>;

        }
    }

    return (
        <div>
            <Header title="My Dashboard" actions={[{icon:<Settings size={20}/>, onClick: () => {}}]}/>
            <div className="p-4">
                <div className="flex items-center space-x-4 mb-6">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-20 h-20 rounded-full" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
                        <p className="text-gray-600">Here's a summary of your journey.</p>
                    </div>
                </div>
                <div className="border-b border-gray-200">
                    <div className="flex items-center -mb-px">
                        {tabs.map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-gray-800'}`}>{tab}</button>
                        ))}
                    </div>
                </div>
                <div className="py-6">{renderContent()}</div>
            </div>
        </div>
    );
  };
  

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home': return <HomeView />;
      case 'feed': return <FeedView />;
      case 'all-activities': return <FeedView defaultTab="Activities" />;
      case 'activity-detail': return <ActivityDetailView />;
      case 'vendors': return <VendorsView />;
      case 'vendor-detail': return <VendorDetailView />;
      case 'product-detail': return <ProductDetailView />;
      case 'events': return <EventsView />;
      case 'event-detail': return <EventDetailView />;
      case 'dashboard': return <DashboardView />;
      case 'profile': return <DashboardView />; // Alias for dashboard
      case 'map': return (<div className="p-4 text-center"><Header title="Map"/><MapPin size={48} className="mx-auto my-8 text-gray-400"/><h2 className="text-xl font-bold">Map Under Construction</h2></div>);
      default: return <HomeView />;
    }
  };

  const bottomNavItems = [
      { key: 'home' as View, icon: <Home />, label: 'Home' },
      { key: 'feed' as View, icon: <Grid />, label: 'Feed' },
      { key: 'vendors' as View, icon: <ShoppingBag />, label: 'Vendors' },
      { key: 'events' as View, icon: <Calendar />, label: 'Events' },
      { key: 'profile' as View, icon: <User />, label: 'Profile' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <NavigationDrawer />
      <AnimatePresence mode="wait">{renderCurrentView()}</AnimatePresence>
      
      {!kioskMode && isAuthenticated && (
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-40">
          <div className="flex items-center justify-around h-16">
            {bottomNavItems.map((tab) => (
              <button key={tab.key} onClick={() => navigateTo(tab.key)} className={`flex flex-col items-center justify-center w-full h-full transition-colors ${currentView === tab.key ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`}>
                {React.cloneElement(tab.icon, { size: 22, strokeWidth: currentView === tab.key ? 2.5 : 2 })}
                <span className={`text-xs mt-1 ${currentView === tab.key ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default App;