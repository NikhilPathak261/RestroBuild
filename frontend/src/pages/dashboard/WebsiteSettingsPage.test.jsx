import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as websiteService from '../../services/websiteService';
import WebsiteSettingsPage from './WebsiteSettingsPage';

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('../../services/websiteService', () => ({
  getWebsiteSettings: vi.fn(),
  updateTheme: vi.fn(),
  updateAbout: vi.fn(),
  publishWebsite: vi.fn(),
}));

describe('WebsiteSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    websiteService.getWebsiteSettings.mockResolvedValue({
      slug: 'spice-house',
      templateName: 'MODERN',
      primaryColor: '#B42318',
      secondaryColor: '#FFFFFF',
      about: 'Original story',
      published: false,
    });
  });

  it('updates the website theme', async () => {
    const { toast } = await import('react-toastify');
    websiteService.updateTheme.mockResolvedValue({
      templateName: 'CLASSIC',
      primaryColor: '#111111',
      secondaryColor: '#eeeeee',
    });

    render(<WebsiteSettingsPage />);

    await screen.findByRole('heading', { name: 'Customize and publish your restaurant website' });
    fireEvent.change(screen.getByLabelText('Template'), { target: { value: 'CLASSIC' } });
    fireEvent.change(screen.getByLabelText('Primary color'), { target: { value: '#111111' } });
    fireEvent.change(screen.getByLabelText('Secondary color'), { target: { value: '#eeeeee' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save theme' }));

    await waitFor(() => {
      expect(websiteService.updateTheme).toHaveBeenCalledWith({
        template: 'CLASSIC',
        primaryColor: '#111111',
        secondaryColor: '#eeeeee',
      });
    });
    expect(toast.success).toHaveBeenCalledWith('Website theme updated.');
  });

  it('updates about content and publishes the website', async () => {
    const { toast } = await import('react-toastify');
    websiteService.updateAbout.mockResolvedValue({ about: 'Updated story' });
    websiteService.publishWebsite.mockResolvedValue({ websiteUrl: 'http://localhost:5173/r/spice-house' });

    render(<WebsiteSettingsPage />);

    await screen.findByDisplayValue('Original story');
    fireEvent.change(screen.getByLabelText('About'), { target: { value: 'Updated story' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save about' }));

    await waitFor(() => {
      expect(websiteService.updateAbout).toHaveBeenCalledWith({ about: 'Updated story' });
    });
    expect(toast.success).toHaveBeenCalledWith('About section updated.');

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

    await waitFor(() => {
      expect(websiteService.publishWebsite).toHaveBeenCalled();
    });
    expect(toast.success).toHaveBeenCalledWith('Website published.');
    expect(screen.getByText(/http:\/\/localhost:5173\/r\/spice-house/)).toBeInTheDocument();
  });
});
