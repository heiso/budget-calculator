import { useForm } from '@conform-to/react'
import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { json, type ActionFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData, useSubmit } from '@remix-run/react'
import { addMonths, addYears, differenceInBusinessDays, endOfMonth, monthsInYear } from 'date-fns'
import { useState } from 'react'
import { z } from 'zod'
import { Field } from '../components/field.tsx'
import { getFreelanceRevenueAfterTaxes } from '../taxes.server.tsx'
import { Button } from '../ui/button.tsx'
import { Link } from '../ui/link.tsx'

/**
 *
 *
 * en tant que client, je veux savoir combien me coute un free
 * en tant que free, je veux savoir combien je peux gagner en fonction du budget du client
 *
 *
 */

const schema = z.object({
  months: z
    .number({ required_error: 'Champ requis', invalid_type_error: 'Saisie invalide' })
    .positive('Saisissez une valeur positive'),
  daysOffPerYear: z
    .number({
      required_error: 'Champ requis',
      invalid_type_error: 'Saisie invalide',
    })
    .positive('Saisissez une valeur positive'),
  clientCostPerMonth: z
    .number({ required_error: 'Champ requis', invalid_type_error: 'Saisie invalide' })
    .positive('Saisissez une valeur positive'),
})

const defaultValue = {
  months: monthsInYear,
  daysOffPerYear: 35,
}

function getDefaultSearchParams(
  searchParams: URLSearchParams,
  defaults: Record<string, string | number>,
) {
  const newSearchParams = new URLSearchParams()
  Object.keys(defaults).forEach((key) => {
    newSearchParams.append(key, searchParams.get(key) || defaults[key].toString())
  })
  return newSearchParams
}

export async function loader({ request }: ActionFunctionArgs) {
  const searchParams = new URL(request.url).searchParams
  const submission = parse(
    searchParams.size === 0 ? getDefaultSearchParams(searchParams, defaultValue) : searchParams,
    { schema },
  )

  if (submission.value) {
    const startDate = endOfMonth(new Date())
    const endDate = addMonths(startDate, submission.value.months)
    const businessDays = differenceInBusinessDays(endDate, startDate)
    const businessDaysPerYear = differenceInBusinessDays(addYears(startDate, 1), startDate)
    const freelanceRevenuePerMonth = getFreelanceRevenueAfterTaxes(
      submission.value.clientCostPerMonth,
    )
    const freelanceRevenuePerYear = freelanceRevenuePerMonth * monthsInYear
    const workedDaysPerYear = businessDaysPerYear - submission.value.daysOffPerYear
    const workedDaysPerMonth = workedDaysPerYear / monthsInYear
    const workedDays = (businessDays * workedDaysPerYear) / businessDaysPerYear
    const freelanceTJM = freelanceRevenuePerMonth / workedDaysPerMonth

    return json({
      lastSubmission: submission,
      result: {
        clienCostPerMonth: submission.value.clientCostPerMonth.toLocaleString('fr-FR'),
        freelanceRevenue: Math.round(freelanceRevenuePerMonth).toLocaleString('fr-FR'),
        freelanceRevenuePerYear: Math.round(freelanceRevenuePerYear).toLocaleString('fr-FR'),
        freelanceTJM: Math.round(freelanceTJM).toLocaleString('fr-FR'),
        workedDays: Math.round(workedDays),
      },
    })
  }

  return json({
    lastSubmission: null,
    result: null,
  })
}

export default function Index() {
  const { lastSubmission, result } = useLoaderData<typeof loader>()
  const [form, fields] = useForm({
    defaultValue,
    ...(lastSubmission && { lastSubmission }),
    shouldValidate: 'onInput',
    constraint: getFieldsetConstraint(schema),
    onValidate: ({ formData }) => parse(formData, { schema }),
  })
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const submit = useSubmit()

  return (
    <div className="p-8 space-y-20 max-w-prose mx-auto">
      <h1 className="text-center text-6xl bg-gradient-to-b from-gray-50 to-pink-200 bg-clip-text text-transparent font-bold">
        Estimation des revenus en auto entreprise
      </h1>

      <Form
        method="GET"
        {...form.props}
        preventScrollReset
        onChange={(event) => submit(event.currentTarget, { preventScrollReset: true })}
        className="grid grid-flow-row gap-6"
      >
        <p>
          Pour utiliser ce calculateur, commencez par faire la simulation du coût d'un salarié via
          le simulateur de l'URSSAF.
        </p>

        <iframe
          src="https://mon-entreprise.urssaf.fr/iframes/simulateur-embauche?integratorUrl=https%253A%252F%252Fentreprise.pole-emploi.fr%252Fcout-salarie%252F&amp;lang=fr&amp;couleur=%255B213%252C67%252C49%255D"
          className={`rounded-md transition-height ease-out block w-full border-none ${
            isSimulatorOpen ? 'h-[500px]' : 'h-0'
          }`}
          title="Simulateur de revenus pour salarié"
        />

        <Button onClick={() => setIsSimulatorOpen(!isSimulatorOpen)}>
          {isSimulatorOpen ? 'Fermer' : "Ouvrir le simulateur de l'URSSAF"}
        </Button>

        <Field
          label="Coût total employeur par mois"
          field={fields.clientCostPerMonth}
          type="number"
        />

        <div className="grid grid-flow-col gap-6">
          <Field label="Durée du contrat (mois)" field={fields.months} type="number" />
          <Field
            label="Jours de congé payés + RTT par an"
            field={fields.daysOffPerYear}
            type="number"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
          <Button primary type="submit" className="w-full md:w-fit md:h-full">
            Calculer
          </Button>
          <ResultText result={result} />
        </div>
        <div className="text-xs flex flex-col gap-1 bg-slate-900 rounded-md px-6 py-4">
          <div>
            <Link target="_blank" to="https://entreprendre.service-public.fr/vosdroits/F36232">
              Cotisation URSSAF
            </Link>{' '}
            : 21,3%
          </div>
          <div>
            <Link
              target="_blank"
              to="https://www.impots.gouv.fr/particulier/questions/comment-declarer-les-revenus-provenant-de-mon-activite-dauto-entrepreneur"
            >
              Abattement forfaitaire sur l'impot sur le revenu
            </Link>{' '}
            : 50%
          </div>
          <div>
            <Link target="_blank" to="https://www.service-public.fr/particuliers/vosdroits/F34328">
              Taux d'imposition sur le revenu
            </Link>
          </div>
          <div className="ml-4 grid grid-flow-row grid-cols-2">
            <div>Jusqu'à 10 777 €</div>
            <div>0 %</div>
            <div>De 10 778 € à 27 478 €</div>
            <div>11 %</div>
            <div>De 27 479 € à 78 570 €</div>
            <div>30 %</div>
            <div>De 78 571 € à 168 994 €</div>
            <div>41 %</div>
            <div>Plus de 168 994 €</div>
            <div>45 %</div>
          </div>
          <div>
            <Link target="_blank" to="https://github.com/heiso/budget-calculator">
              Code Open Source
            </Link>
          </div>
        </div>
      </Form>
    </div>
  )
}

type ResultTextProps = {
  result: ReturnType<typeof useLoaderData<typeof loader>>['result']
}

function ResultText({ result }: ResultTextProps) {
  if (!result) {
    return (
      <div className="relative bg-slate-900 rounded-md px-6 py-4 flex flex-col gap-4">
        <div className="absolute z-10 top-0 bottom-0 rounded-md left-0 right-0 backdrop-blur-sm"></div>
        <div>
          Pour un coût client de <span className="text-pink-500 font-bold">10 000</span>
          <span className="text-xs"> €</span> le freelance touche{' '}
          <span className="text-pink-500 font-bold">5 000</span>
          <span className="text-xs"> € HT</span> après impots, soit{' '}
          <span className="text-pink-500 font-bold">50 000</span>
          <span className="text-xs"> € HT</span> par an.
        </div>
        <div className="opacity-80 text-sm">
          ( TJM de <span className="text-pink-500 font-bold">500</span> € HT pour{' '}
          <span className="text-pink-500 font-bold">200</span> jours travaillés )
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-900 rounded-md px-6 py-4 flex flex-col gap-4">
      <div>
        Pour un coût client de{' '}
        <span className="text-pink-500 font-bold">{result.clienCostPerMonth}</span>
        <span className="text-xs"> €</span> le freelance touche{' '}
        <span className="text-pink-500 font-bold">{result.freelanceRevenue}</span>
        <span className="text-xs"> € HT</span> après impots, soit{' '}
        <span className="text-pink-500 font-bold">{result.freelanceRevenuePerYear}</span>
        <span className="text-xs"> € HT</span> par an.
      </div>
      <div className="opacity-80 text-sm">
        ( TJM de <span className="text-pink-500 font-bold">{result.freelanceTJM}</span> € HT pour{' '}
        <span className="text-pink-500 font-bold">{result.workedDays}</span> jours travaillés )
      </div>
    </div>
  )
}
