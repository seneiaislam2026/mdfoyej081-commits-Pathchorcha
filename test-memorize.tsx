import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import Memorize from './src/pages/Memorize';
try {
  const html = renderToString(<StaticRouter location="/"><Memorize /></StaticRouter>);
  console.log("Success! HTML length:", html.length);
} catch (e: any) {
  console.error("CRASH:", e.message);
}
