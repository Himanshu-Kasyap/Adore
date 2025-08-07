import React from 'react';

const NewsSection = () => {
  const newsItems = [
    {
      id: 1,
      title: 'New Agricultural Subsidies Available for Small Farmers',
      content: 'The government has announced new subsidy programs to support small-scale farmers with equipment and seed purchases.',
      publishDate: '2024-01-15',
      category: 'Agriculture'
    },
    {
      id: 2,
      title: 'Mobile Health Clinic Expands Services to Remote Areas',
      content: 'Our mobile health clinic program now covers 15 additional rural communities, providing essential healthcare services.',
      publishDate: '2024-01-12',
      category: 'Healthcare'
    },
    {
      id: 3,
      title: 'Digital Literacy Program Launches in 20 Villages',
      content: 'A new initiative to improve digital skills and internet access has been launched, benefiting over 500 families.',
      publishDate: '2024-01-10',
      category: 'Education'
    }
  ];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            News & Updates
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Stay informed about the latest developments in our rural communities
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {newsItems.map((news) => (
            <article 
              key={news.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {news.category}
                  </span>
                  <time className="text-xs sm:text-sm text-gray-500">
                    {formatDate(news.publishDate)}
                  </time>
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 line-clamp-2 leading-tight">
                  {news.title}
                </h3>
                
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
                  {news.content}
                </p>
                
                <button className="text-green-600 font-medium hover:text-green-700 transition-colors text-sm sm:text-base">
                  Read More →
                </button>
              </div>
            </article>
          ))}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <button className="w-full sm:w-auto bg-green-600 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
            View All News
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;