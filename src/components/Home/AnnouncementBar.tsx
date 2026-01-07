export default function AnnouncementBar() {
  return (
    <div className="bg-primary-black text-white py-3">
      <div className="container-wide px-4 flex justify-between items-center">
        <div>
          <i className="fas fa-bullhorn text-primary-red mr-2"></i>
          <strong>Latest Announcement:</strong> School reopens on January 7th
        </div>
        {/*
        <a href="/calendar" className="text-primary-red font-semibold">
        
          View All Events <i className="fas fa-arrow-right ml-1"></i>
        </a>
        */}
      </div>
    </div>
  );
}
