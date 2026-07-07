import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as analyticsService from '../../services/analyticsService';

function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [bottomItems, setBottomItems] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [ratings, setRatings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [summaryResponse, dailyResponse, topResponse, bottomResponse, categoryResponse, ratingsResponse] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getDailyRevenue(),
          analyticsService.getTopMenuItems(),
          analyticsService.getBottomMenuItems(),
          analyticsService.getCategoryStats(),
          analyticsService.getRatingsSummary(),
        ]);

        setSummary(summaryResponse);
        setDailyRevenue(dailyResponse);
        setTopItems(topResponse);
        setBottomItems(bottomResponse);
        setCategoryStats(categoryResponse);
        setRatings(ratingsResponse);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load analytics.');
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (isLoading) {
    return <section className="empty-state">Loading analytics...</section>;
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Analytics</p>
        <h1>Business performance</h1>
      </div>

      <div className="metric-grid">
        <article className="metric-card">
          <span>Total Orders</span>
          <strong>{summary?.totalOrders ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Today&apos;s Orders</span>
          <strong>{summary?.todayOrders ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Total Revenue</span>
          <strong>₹{summary?.totalRevenue ?? 0}</strong>
        </article>
        <article className="metric-card">
          <span>Average Rating</span>
          <strong>{summary?.averageRating ?? 0}</strong>
        </article>
      </div>

      <div className="analytics-grid">
        <AnalyticsList title="Daily Revenue" items={dailyRevenue} valueKey="revenue" labelKey="label" prefix="₹" />
        <AnalyticsList title="Most Ordered Dishes" items={topItems} valueKey="quantity" labelKey="menuItemName" />
        <AnalyticsList title="Least Ordered Dishes" items={bottomItems} valueKey="quantity" labelKey="menuItemName" />
        <AnalyticsList title="Category Statistics" items={categoryStats} valueKey="quantity" labelKey="categoryName" />
      </div>

      <section className="list-panel">
        <h2>Ratings Distribution</h2>
        {ratings && (
          <div className="rating-grid">
            {Object.entries(ratings.ratingDistribution).map(([rating, count]) => (
              <article className="metric-card" key={rating}>
                <span>{rating} star</span>
                <strong>{count}</strong>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function AnalyticsList({ title, items, labelKey, valueKey, prefix = '' }) {
  return (
    <section className="list-panel">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <div className="empty-state compact">No data yet.</div>
      ) : (
        <div className="analytics-list">
          {items.map((item) => (
            <div key={item[labelKey]}>
              <span>{item[labelKey]}</span>
              <strong>{prefix}{item[valueKey]}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AnalyticsPage;
