import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="grid grid-cols-[13%_87%] m-10 bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Sidebar */}
        <nav className="bg-indigo-900 rounded-l-2xl py-3 px-2">
          <h1 className="text-white text-2xl font-medium text-center my-5 font-nunito">Skill Share</h1>
          
          <ul className="space-y-2">
            <li className="nav-item active">
              <a href="#" className="flex items-center justify-center text-white p-3 ml-2 rounded-l-2xl hover:bg-white hover:text-black transition-colors group">
                <i className="fa fa-house text-xl w-12"></i>
                <span className="w-24">Home</span>
              </a>
            </li>
            
            <li className="nav-item">
              <a href="#" className="flex items-center justify-center text-white p-3 ml-2 rounded-l-2xl hover:bg-white hover:text-black transition-colors">
                <i className="fa fa-user text-xl w-12"></i>
                <span className="w-24">Profile</span>
              </a>
            </li>

            <li className="nav-item">
              <a href="#" className="flex items-center justify-center text-white p-3 ml-2 rounded-l-2xl hover:bg-white hover:text-black transition-colors">
                <i className="fa fa-calendar-check text-xl w-12"></i>
                <span className="w-24">Schedule</span>
              </a>
            </li>

            <li className="nav-item">
              <a href="#" className="flex items-center justify-center text-white p-3 ml-2 rounded-l-2xl hover:bg-white hover:text-black transition-colors">
                <i className="fa fa-book text-xl w-12"></i>
                <span className="w-24">Courses</span>
              </a>
            </li>

            <li className="nav-item">
              <button onClick={handleLogout} className="flex items-center justify-center text-white p-3 ml-2 rounded-l-2xl hover:bg-white hover:text-black transition-colors w-full">
                <i className="fa fa-right-from-bracket text-xl w-12"></i>
                <span className="w-24">Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <section className="grid grid-cols-[75%_25%]">
          {/* Left Content */}
          <div className="bg-gray-50 m-4 p-5 rounded-2xl">
            {/* Popular Skills Section */}
            <div className="mb-8">
              <h1 className="text-xl font-bold mb-5">Popular Skills</h1>
              <div className="grid grid-cols-5 grid-rows-2 gap-3 h-[300px]">
                {/* Skill Cards */}
                <div className="relative rounded-xl overflow-hidden shadow-sm group">
                  <img src="https://source.unsplash.com/random/800x600/?programming" alt="Programming" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:opacity-0 transition-opacity">
                    <h3 className="absolute bottom-2 right-2 text-white font-semibold">Programming</h3>
                  </div>
                </div>
                {/* Add more skill cards as needed */}
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="grid grid-cols-[55%_40%] gap-10">
              <div>
                <h1 className="text-xl font-bold mb-4">Weekly Schedule</h1>
                <div className="space-y-3">
                  {/* Schedule Items */}
                  <div className="grid grid-cols-[15%_60%_25%] items-center bg-gradient-to-r from-blue-400/50 to-cyan-200 rounded-xl shadow-sm">
                    <div className="text-center transform -translate-y-1">
                      <h1 className="text-2xl font-semibold">13</h1>
                      <p className="uppercase text-sm font-semibold">mon</p>
                    </div>
                    <div className="border-l-2 border-gray-600">
                      <h2 className="ml-3 text-lg font-semibold">Web Development</h2>
                      <div className="flex ml-2">
                        {/* Add participant images here */}
                      </div>
                    </div>
                    <button className="bg-white/90 px-6 py-2 mx-auto rounded-full shadow-sm hover:scale-105 transition-transform">
                      Join
                    </button>
                  </div>
                  {/* Add more schedule items */}
                </div>
              </div>

              {/* Personal Stats */}
              <div>
                <h1 className="text-xl font-bold mb-4">Personal Stats</h1>
                <div className="grid grid-cols-2 grid-rows-2 gap-3">
                  <div className="col-span-2 flex items-center justify-between bg-purple-200/60 rounded-xl p-4 shadow-sm">
                    <p className="font-bold">Completed Courses: 5</p>
                    <img src="https://source.unsplash.com/random/100x100/?trophy" alt="Trophy" className="w-20 object-contain" />
                  </div>
                  {/* Add more stat cards */}
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="bg-gray-50 my-4 mr-4 p-3 rounded-2xl">
            {/* User Info */}
            <div className="grid grid-cols-[30%_55%_15%] items-center px-3">
              <div className="flex gap-4">
                <i className="fa fa-bell text-xl"></i>
                <i className="fa fa-message text-xl"></i>
              </div>
              <h4 className="ml-10">John Doe</h4>
              <img src="https://source.unsplash.com/random/100x100/?avatar" alt="User" className="w-10 h-10 rounded-full" />
            </div>

            {/* Progress Section */}
            <div className="bg-blue-100 p-3 m-4 rounded-2xl shadow-sm">
              <h1 className="text-lg font-bold mb-3">Learning Progress</h1>
              <div className="flex items-center gap-3">
                <div className="relative w-20 h-20">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center">
                    <h2 className="text-lg font-semibold">85<small>%</small></h2>
                  </div>
                </div>
                <div>
                  <p><span className="font-bold">Today:</span> 2 hours</p>
                  <p><span className="font-bold">This Week:</span> 12 hours</p>
                  <p><span className="font-bold">This Month:</span> 45 hours</p>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div>
              <h1 className="text-lg font-bold mx-4 mb-3">Recent Activities</h1>
              <div className="space-y-3 px-3">
                <div className="bg-white p-2 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="https://source.unsplash.com/random/100x100/?person" alt="" className="w-6 h-6 rounded-full" />
                    <h2 className="font-bold text-sm">Sarah</h2>
                  </div>
                  <img src="https://source.unsplash.com/random/400x300/?learning" alt="" className="w-full aspect-video rounded-xl mb-2 object-cover" />
                  <p className="text-sm">Completed the Advanced JavaScript Course! 🎉</p>
                </div>
                {/* Add more activity cards */}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
