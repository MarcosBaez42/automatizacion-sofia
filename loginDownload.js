import { chromium } from 'playwright';
import fs from 'fs/promises';
import { cfg } from './config.js';
import path from 'path';

export async function iniciarSesion() {
    const headless = process.env.HEADLESS ? process.env.HEADLESS === 'true' : false;
    const slowMo = process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 100;
    const browser = await chromium.launch({ headless, slowMo });
    const page = await browser.newPage();

    await page.goto('http://senasofiaplus.edu.co/sofia-public/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('#registradoBox1', { timeout: 60000 });

    const fh = await page.$('#registradoBox1');
    if (!fh) {
        throw new Error('No se encontró el frame de login (#registradoBox1)');
    }
    const loginFrame = await fh.contentFrame();
    await loginFrame.waitForSelector('input#username');
    await loginFrame.getByRole('textbox', { name: 'Número de Documento' }).fill(cfg.sofiaUser);
    await loginFrame.getByRole('textbox', { name: 'Contraseña' }).fill(cfg.sofiaPass);
    await loginFrame.getByRole('button', { name: 'Ingresar' }).click();

    const ROLE_SELECT = '#seleccionRol\\:roles';
    await page.waitForSelector(ROLE_SELECT, { timeout: 60000 });
    await page.selectOption(ROLE_SELECT, { label: 'Gestión Desarrollo Curricular' });

    await page.waitForSelector('#side-menu, #menu_lateral', { timeout: 60000 });
    await page.getByRole('link', { name: 'Ejecución de la Formación' }).click();
    await page.getByRole('link', { name: 'Administrar Ruta de Aprendizaje' }).click();
    await page.getByRole('link', { name: 'Reportes ', exact: true }).click();
    await page.getByRole('link', { name: 'Reporte de Juicios de Evaluación', exact: true }).first().click();

    await page.waitForSelector('iframe#contenido', { timeout: 60000 });

    return { browser, page };
}

export async function descargarReporte(page, codigoFicha) {
    try {
        const contenidoHandle = await page.waitForSelector('iframe#contenido', { timeout: 60000 });
        let frame = await contenidoHandle.contentFrame();

        await frame.getByRole('link', { name: 'Buscar Ficha de Caracterización' }).click();

        const modalHandle = await frame.waitForSelector('iframe#modalDialogContentviewDialog2', { timeout: 60000 });
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
            frame.getByRole('button', { name: 'Generar Reporte' }).click(),
        ]);

        const suggested = await download.suggestedFilename();
        const ext = path.extname(suggested);
        const base = path.basename(suggested, ext);
        const finalName = `${base} ${codigoFicha}${ext}`;
        console.log('Nombre sugerido por Sofía:', finalName);

        const filePath = path.join(cfg.outputDir, finalName);
        await fs.mkdir(cfg.outputDir, { recursive: true });
        await download.saveAs(filePath);

        return filePath;
    } catch (error) {
        console.error('Error al descargar el reporte:', error);
        throw error;
    }
}
