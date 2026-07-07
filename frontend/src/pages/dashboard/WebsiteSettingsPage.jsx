import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as websiteService from '../../services/websiteService';

const defaultTheme = {
  template: 'MODERN',
  primaryColor: '#B42318',
  secondaryColor: '#FFFFFF',
};

function WebsiteSettingsPage() {
  const [theme, setTheme] = useState(defaultTheme);
  const [about, setAbout] = useState('');
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const response = await websiteService.getWebsiteSettings();
        if (!isMounted) {
          return;
        }

        const settings = response.data;
        setTheme({
          template: settings.templateName || 'MODERN',
          primaryColor: settings.primaryColor || '#B42318',
          secondaryColor: settings.secondaryColor || '#FFFFFF',
        });
        setAbout(settings.about || '');
        setSlug(settings.slug || '');
        setPublished(Boolean(settings.published));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Create a restaurant profile before editing the website.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleThemeChange(event) {
    setTheme((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleThemeSubmit(event) {
    event.preventDefault();
    setIsSavingTheme(true);

    try {
      const response = await websiteService.updateTheme(theme);
      setTheme({
        template: response.data.templateName,
        primaryColor: response.data.primaryColor,
        secondaryColor: response.data.secondaryColor,
      });
      toast.success('Website theme updated.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update theme.');
    } finally {
      setIsSavingTheme(false);
    }
  }

  async function handleAboutSubmit(event) {
    event.preventDefault();
    setIsSavingAbout(true);

    try {
      await websiteService.updateAbout({ about });
      toast.success('About section updated.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update about section.');
    } finally {
      setIsSavingAbout(false);
    }
  }

  async function handlePublish() {
    setIsPublishing(true);

    try {
      const response = await websiteService.publishWebsite();
      setPublished(true);
      setPublishedUrl(response.data.websiteUrl);
      toast.success('Website published.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish website.');
    } finally {
      setIsPublishing(false);
    }
  }

  if (isLoading) {
    return <section className="empty-state">Loading website settings...</section>;
  }

  return (
    <section className="page-stack">
      <div>
        <p className="eyebrow">Website Settings</p>
        <h1>Customize and publish your restaurant website</h1>
      </div>

      <div className="settings-grid">
        <form className="dashboard-form" onSubmit={handleThemeSubmit}>
          <h2>Theme</h2>

          <label>
            Template
            <select name="template" value={theme.template} onChange={handleThemeChange}>
              <option value="MODERN">Modern</option>
              <option value="CLASSIC">Classic</option>
              <option value="MINIMAL">Minimal</option>
            </select>
          </label>

          <div className="form-grid">
            <label>
              Primary color
              <input name="primaryColor" type="color" value={theme.primaryColor} onChange={handleThemeChange} />
            </label>

            <label>
              Secondary color
              <input name="secondaryColor" type="color" value={theme.secondaryColor} onChange={handleThemeChange} />
            </label>
          </div>

          <button type="submit" disabled={isSavingTheme}>
            {isSavingTheme ? 'Saving theme...' : 'Save theme'}
          </button>
        </form>

        <article className="website-preview" style={{ '--primary': theme.primaryColor, '--secondary': theme.secondaryColor }}>
          <span>{theme.template}</span>
          <h2>Restaurant Website Preview</h2>
          <p>{about || 'Your restaurant story will appear here.'}</p>
        </article>
      </div>

      <form className="dashboard-form" onSubmit={handleAboutSubmit}>
        <h2>About Section</h2>
        <label>
          About
          <textarea value={about} onChange={(event) => setAbout(event.target.value)} rows={6} maxLength={2000} required />
        </label>
        <button type="submit" disabled={isSavingAbout}>
          {isSavingAbout ? 'Saving about...' : 'Save about'}
        </button>
      </form>

      <section className="publish-panel">
        <div>
          <h2>{published ? 'Website is published' : 'Publish website'}</h2>
          <p className="muted">
            Public URL: {publishedUrl || (slug ? `${window.location.origin}/r/${slug}` : 'Create restaurant profile first')}
          </p>
        </div>
        <button type="button" onClick={handlePublish} disabled={isPublishing || !slug}>
          {isPublishing ? 'Publishing...' : published ? 'Publish again' : 'Publish'}
        </button>
      </section>
    </section>
  );
}

export default WebsiteSettingsPage;
