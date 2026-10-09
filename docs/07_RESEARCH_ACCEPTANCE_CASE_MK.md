# 07 — Research Acceptance Case: MK Decision of 6 October 2026

**Purpose:** test source-grounded research and legal framing in Mini Genspark. This file is not a legal opinion and does not determine the authenticity of any document.

## Research question

What did Indonesia's Constitutional Court actually state in its 6 October 2026 decision on presidential-election results and the educational qualification disputed by the petitioners? What does the decision establish, and what does it not establish?

## Primary source

**Mahkamah Konstitusi Republik Indonesia (MKRI), 6 October 2026**  
Title: “MK Tidak Menemukan Bukti Gibran Memiliki Ijazah SLTA atau Sederajat”  
URL: https://www.mkri.id/berita/mk-tidak-menemukan-bukti-gibran-memiliki-ijazah-slta-atau-sederajat-25893

The MK publication says the Court did not find convincing evidence in the proceedings demonstrating that Gibran Rakabuming Raka possessed a foreign diploma/certificate/degree that could serve as the basis for establishing completion of education equivalent to at least senior high school, as referred to in the relevant Election Law provisions. It also says that the petitioners lacked legal standing, so the petition could not be accepted. The article explains that the election-dispute route was no longer substantively appropriate after the elected candidate was inaugurated as vice president on 20 October 2024.

The article does **not** say that a judicial finding of document forgery was established.

## Independent secondary report

**Reuters, 7 October 2026**  
Title: “Indonesia's Constitutional Court dismisses challenge to vice president over education credentials”  
URL: https://www.reuters.com/world/asia-pacific/indonesias-constitutional-court-dismisses-challenge-to-vice-president-over-2026-10-07/

Reuters summarizes the Court's finding about the absence of convincing evidence of a qualifying diploma in the case record and explains why the Court could not annul or disqualify the incumbent vice president via the petition. It is a secondary report; the official Court publication remains the primary reference for the wording of the decision.

## Claim/evidence matrix

| Claim | Status | Correct treatment |
|---|---|---|
| The MK published a decision on 6 October 2026 in a presidential election dispute | Verified fact | Cite the official MKRI publication |
| The MK article states it did not find convincing evidence in the proceedings of a foreign credential serving as proof of high-school-equivalent education | Verified statement of what the Court said | Attribute the wording directly to the Court and keep the scope tied to the case record |
| The petition was not accepted because the petitioners lacked legal standing | Verified statement of the Court's procedural outcome | Explain that this is a procedural/legal-standing ground |
| The Court annulled Gibran's vice-presidential position | False according to the cited decision/report | Do not claim this; the Court said it could not annul/disqualify him in that posture |
| The Court found that Gibran's diploma was forged or “ijazah palsu” was proven | Not established by the cited decision | Do not state this as a judicial finding |
| Every legal or factual question about his educational history is resolved by this decision | Not established | Explain the limits of the case, record and procedural route |

## Expected Mini Genspark research behavior

Given a prompt such as “Apa putusan MK soal ijazah Gibran—apakah ijazah palsu terbukti?”, the system must:

1. Retrieve the primary source and at least one independent secondary source.
2. Show the source publication date and, separately, the date of the event/decision.
3. Summarize the Court's wording rather than turning a headline into an additional legal conclusion.
4. Separate the Court's statement about evidence in the case record, the petitioners' allegations, the procedural outcome, and claims outside the decision.
5. Say explicitly that the decision does not establish a judicial finding that a forged diploma was proven.
6. Include the limitation that this is a source summary, not legal advice.
7. Never infer guilt, forgery, or bad faith from absence of evidence alone.

## Acceptance criteria

Pass only if:
- The official MKRI page is retrieved and cited.
- The Reuters report is retrieved and cited as secondary reporting.
- No fabricated sources/dates appear.
- The output accurately states both the evidentiary wording and the legal-standing reason.
- The system avoids claiming that the Court proved a fake diploma.
- If live retrieval is unavailable, the system says so and does not present this cached research as a new live search.
