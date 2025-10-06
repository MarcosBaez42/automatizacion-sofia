import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { cfg } from '../config.js';

export class SofiaPlusClient {
  constructor({ headless, slowMo } = {}) {
    this.headless =
      headless ?? (process.env.HEADLESS ? process.env.HEADLESS === 'true' : false);
    this.slowMo = slowMo ?? (process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 100);
    this.outputDir = cfg.outputDir;
    this.browser = null;
    this.page = null;
    this.initializationPromise = null;
  }

  async #initializeBrowser() {
    try {
      this.browser = await chromium.launch({ headless: this.headless, slowMo: this.slowMo });
      this.page = await this.browser.newPage();
      return this.page;
    } catch (error) {
      this.browser = null;
      this.page = null;
      this.initializationPromise = null;
      throw new Error('No se pudo iniciar el navegador de Sofía Plus.', { cause: error });
    }
  }

  async #ensurePage() {
    if (this.page) {
      return this.page;
    }

    if (!this.initializationPromise) {
      this.initializationPromise = this.#initializeBrowser();
    }

    try {
      await this.initializationPromise;
      if (!this.page) {
        throw new Error('La página de Sofía Plus no se inicializó correctamente.');
      }
      return this.page;
    } catch (error) {
      throw new Error('No fue posible preparar la sesión con Sofía Plus.', { cause: error });
    }
  }

  async login() {
    const page = await this.#ensurePage();

    try {
      await page.goto('http://senasofiaplus.edu.co/sofia-public/');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForSelector('#registradoBox1', { timeout: 60000 });

      const iframeHandle = await page.$('#registradoBox1');
      if (!iframeHandle) {
        throw new Error(
          'No se encontró el iframe de inicio de sesión (#registradoBox1); verifique que la página cargó correctamente.'
        );
      }

      const loginFrame = await iframeHandle.contentFrame();
      await loginFrame.waitForSelector('input#username');
      await loginFrame.getByRole('textbox', { name: 'Número de Documento' }).fill(cfg.sofiaUser);
      await loginFrame.getByRole('textbox', { name: 'Contraseña' }).fill(cfg.sofiaPass);
      await loginFrame.getByRole('button', { name: 'Ingresar' }).click();

      await page.waitForSelector('#seleccionRol\\:roles', { timeout: 60000 });
    } catch (error) {
      throw new Error('Error durante el inicio de sesión en Sofía Plus.', { cause: error });
    }
  }

  async selectRole(roleLabel = 'Gestión Desarrollo Curricular') {
    const page = await this.#ensurePage();

    try {
      const ROLE_SELECT = '#seleccionRol\\:roles';
      await page.waitForSelector(ROLE_SELECT, { timeout: 60000 });
      await page.selectOption(ROLE_SELECT, { label: roleLabel });
    } catch (error) {
      throw new Error(`No fue posible seleccionar el rol "${roleLabel}" en Sofía Plus.`, {
        cause: error
      });
    }
  }

  async navigateToReport() {
    const page = await this.#ensurePage();

    try {
      await page.waitForSelector('#side-menu, #menu_lateral', { timeout: 60000 });
      await page.getByRole('link', { name: 'Ejecución de la Formación' }).click();
      await page.getByRole('link', { name: 'Administrar Ruta de Aprendizaje' }).click();
      await page.getByRole('link', { name: 'Reportes ', exact: true }).click();
      await page
        .getByRole('link', { name: 'Reporte de Juicios de Evaluación', exact: true })
        .first()
        .click();
      await page.waitForSelector('iframe#contenido', { timeout: 60000 });
    } catch (error) {
      throw new Error('No fue posible navegar al reporte de juicios de evaluación en Sofía Plus.', {
        cause: error
      });
    }
  }

  async downloadReport(codigoFicha) {
    if (!codigoFicha) {
      throw new Error('Se requiere un código de ficha válido para descargar el reporte.');
    }

    const page = await this.#ensurePage();

    try {
      const contenidoHandle = await page.waitForSelector('iframe#contenido', { timeout: 60000 });
      let frame = await contenidoHandle.contentFrame();

      await frame.getByRole('link', { name: 'Buscar Ficha de Caracterización' }).click();

      const modalHandle = await frame.waitForSelector('iframe#modalDialogContentviewDialog2', {
        timeout: 60000
      });
      const modalFrame = await modalHandle.contentFrame();
      await modalFrame.waitForSelector('input[id$="codigoFichaITX"]', { timeout: 60000 });

      await modalFrame.fill('input[id$="codigoFichaITX"]', String(codigoFicha));
      await modalFrame.getByRole('button', { name: 'Consultar' }).click();
      await modalFrame.waitForSelector('table[id$="dtFichas"] tbody tr');
      const firstRow = modalFrame.locator('table[id$="dtFichas"] tbody tr').first();
      await firstRow.locator('button, a').first().click();

      try {
        await frame.waitForLoadState('domcontentloaded');
      } catch {
        const recapture = await page.waitForSelector('iframe#contenido', { timeout: 60000 });
        frame = await recapture.contentFrame();
      }

      await frame.waitForSelector('input#frmForma1\\:btnConsultar');

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        frame.getByRole('button', { name: 'Generar Reporte' }).click()
      ]);

      const suggested = await download.suggestedFilename();
      const ext = path.extname(suggested);
      const base = path.basename(suggested, ext);
      const finalName = `${base} ${codigoFicha}${ext}`;
      console.log(`Archivo sugerido por Sofía Plus para la ficha ${codigoFicha}: ${finalName}`);

      const filePath = path.join(this.outputDir, finalName);
      await fs.mkdir(this.outputDir, { recursive: true });
      await download.saveAs(filePath);

      return filePath;
    } catch (error) {
      throw new Error(
        `Fallo al descargar el reporte de juicios de evaluación para la ficha ${codigoFicha}.`,
        { cause: error }
      );
    }
  }

  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
      }
    } finally {
      this.browser = null;
      this.page = null;
      this.initializationPromise = null;
    }
  }
}

export default SofiaPlusClient;