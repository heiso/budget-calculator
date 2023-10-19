/**
 * @description Taux d'imposition sur le revenu en AE par rapport au CA
 * @link https://www.service-public.fr/particuliers/vosdroits/F34328
 */
const TAUX_IMPOSITION_BY_REVENUE = [
  { minRevenue: 0, maxRevenue: 10_777, rate: 0 },
  { minRevenue: 10_778, maxRevenue: 27_478, rate: 0.11 },
  { minRevenue: 27_479, maxRevenue: 78_570, rate: 0.3 },
  { minRevenue: 78_571, maxRevenue: 168_994, rate: 0.41 },
  { minRevenue: 168_995, maxRevenue: Infinity, rate: 0.45 },
]

/**
 * @description Abattement forfaitaire impot sur le revenu en AE
 * @link https://www.impots.gouv.fr/particulier/questions/comment-declarer-les-revenus-provenant-de-mon-activite-dauto-entrepreneur
 */
const ABATTEMENT_FORFAITAIRE_IMPOT_AE = 0.5

/**
 * @description Cotisation URSSAF en BNC, 21.10% + 0.20%
 * @link https://entreprendre.service-public.fr/vosdroits/F36232
 */
const COTISATION_URSSAF_AE = 0.213

export function getTauxImposition(taxableRevenue: number) {
  return TAUX_IMPOSITION_BY_REVENUE.find(
    ({ minRevenue, maxRevenue }) => minRevenue < taxableRevenue && taxableRevenue < maxRevenue,
  )!.rate
}

export function getFreelanceRevenueAfterTaxes(revenueBeforeTaxes: number) {
  const afterURSSAF = revenueBeforeTaxes - revenueBeforeTaxes * COTISATION_URSSAF_AE
  const taxableRevenue = revenueBeforeTaxes - revenueBeforeTaxes * ABATTEMENT_FORFAITAIRE_IMPOT_AE
  const afterTaxes = afterURSSAF - taxableRevenue * getTauxImposition(taxableRevenue)

  return afterTaxes
}
