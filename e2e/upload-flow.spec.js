import { test, expect } from '@playwright/test';

test('muestra el flujo inicial de subida', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Gestor Inteligente de Documentos');
  await expect(page.getByRole('button', { name: /subir y clasificar/i })).toBeVisible();
});