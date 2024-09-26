import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { switchMap, map } from "rxjs/operators";

interface Document {
  id: string;
  publishedDate: string;
  fileName: string;
  summary: string;
  relevance: string;
  selected?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class SearchService {
  private embeddingApiUrl = process.env["EMBEDDING_API_URL"];
  private embeddingApiKey = process.env["EMBEDDING_API_KEY"];
  private searchApiUrl = process.env["SEARCH_API_URL"];
  private searchApiKey = process.env["SEARCH_API_KEY"];
  private generateSynthesisApiUrl = process.env["GENERATE_API_URL"];
  private generateSynthesisApiCode = process.env["GENERATE_API_KEY"];

  constructor(private http: HttpClient) {}

  // SearchDocument mock API
  searchDocument(query: string): Observable<Document[]> {
    if (!this.embeddingApiUrl) {
      throw new Error("EMBEDDING_API_URL is not defined");
    }
    if (!this.embeddingApiKey) {
      throw new Error("EMBEDDING_API_KEY is not defined");
    }

    const embeddingHeaders = new HttpHeaders({
      "Content-Type": "application/json",
      "api-key": this.embeddingApiKey,
    });

    const embeddingBody = {
      input: query,
    };

    // Call the embedding API
    return this.http
      .post<any>(this.embeddingApiUrl, embeddingBody, {
        headers: embeddingHeaders,
      })
      .pipe(
        switchMap((embeddingResponse) => {
          // Extract the embedding vector from the response
          const embeddingVector = embeddingResponse.data[0].embedding;
          if (!this.searchApiUrl) {
            throw new Error("SEARCH_API_URL is not defined");
          }
          if (!this.searchApiKey) {
            throw new Error("SEARCH_API_KEY is not defined");
          }

          // Set up headers for the search API
          const searchHeaders = new HttpHeaders({
            "Content-Type": "application/json",
            "api-key": this.searchApiKey,
          });

          // Prepare the request body for the search API
          const searchBody = {
            search: query,
            vectorQueries: [
              {
                kind: "vector",
                vector: embeddingVector,
                k: 5,
                fields: "vector",
              },
            ],
            select: "file_name,summary,id",
          };

          // Call the AI Search Endpoint
          return this.http.post<any>(this.searchApiUrl, searchBody, {
            headers: searchHeaders,
          });
        }),
        map((searchResponse) => {
          // Map the search response to an array of Document objects
          const documents: Document[] = searchResponse.value.map(
            (item: any) => ({
              id: item.id,
              publishedDate: "2022-03-11", // TODO Get the published date from the document
              fileName: item.file_name,
              summary: item.summary,
              relevance: "Great", // TODO: Calculate relevance
              selected: false,
            })
          );
          return documents;
        })
      );
  }

  // GenerateSynthesis Mock API
  generateSynthesis(requestBody: any): Observable<any> {
    console.log("API Request Body: ", requestBody);
    if (!this.generateSynthesisApiUrl) {
      throw new Error("GENERATE_API_URL is not defined");
    }
    if (!this.generateSynthesisApiCode) {
      throw new Error("GENERATE_API_KEY is not defined");
    }

    const synthesisHeaders = new HttpHeaders({
      "Content-Type": "application/json",
    });

    const fullUrl = `${this.generateSynthesisApiUrl}?code=${this.generateSynthesisApiCode}`;

    // return this.http.post<any>(fullUrl, requestBody, { headers: synthesisHeaders });

    const mockData = {
      id: "9fa85be8-8996-49ba-bc3e-dd5225a46859",
      query: "hello",
      combined_summaries: [
        {
          pdf_name: "intermediate/T2.pdf",
          summary:
            "The documents contain quotes from Canadian Prime Ministers, details about significant events like the Canadian men's hockey team winning the gold medal in the 2010 Winter Olympics, and information from a Canadian Citizen Study guide. This guide includes details about historical figures, locations of interest and legal knowledge required for citizenship. The document also invites readers to provide feedback online.",
        },
      ],
      content_texts: [
        "Your Canadian Citizenship Study Guide\nMemorable Quotes\n66\n“\u0007\nFor here [in Canada], \nI want the marble to remain the marble; \nthe granite to remain the granite; \nthe oak to remain the oak; \nand out of these elements, \nI would build a nation great among the nations of the world.”\n  — \u0007\nSir Wilfrid Laurier \n7th Prime Minister of Canada \nJuly 11, 1896 – October 6, 1911\n“\u0007\nI am a Canadian, \na free Canadian, \nfree to speak without fear, \nfree to worship in my own way, \nfree to stand for what I think right, \nfree to oppose what I believe wrong, \nor free to choose those \nwho shall govern my country. \nThis heritage of freedom \nI pledge to uphold \nfor myself and all mankind.”\n— \u0007\nJohn Diefenbaker \n13th Prime Minister of Canada \nJune 21, 1957 – April 22, 1963\nThese quotes do not need to be learned for the citizenship test.  \nDiscover Canada\nTeam Canada won gold \nin men’s hockey at the \n2010 Winter Olympics in \nVancouver\nDiscover Canada\nPublications Feedback Survey\nWe invite you to provide us with your comments on this publication  \nby completing our electronic feedback survey at cic.gc.ca/publications-survey.\nVisit us online \nFacebook: www.facebook.com/CitCanada \nYouTube: www.youtube.com/CitImmCanada \nTwitter: @CitImmCanada \nWebsite: www.cic.gc.ca\nAvailable in alternative formats upon request.\n",
        "61\nPage 23\nThe 1st Battalion, The Regina Rifle Regiment, \nAssault Landing at Courseulles, France, June 1944\nRoyal Regina Rifles Trust Fund \nPainting by O.N. Fisher, 1950\nGive, The Canadian Red Cross\nArchibald Bruce Stapleton \nCWM 19720114-023 \n© Canadian War Museum\nDiscover Canada\nPage 24\nToronto business district\nStock image\nMedical researcher\nStock image\nPage 25\nVietnamese Canadians\nAlex Pylyshyn\nF-86 Sabre, Royal Canadian Air Force\nNational Defence\nCirque du Soleil\nPhoto: OSA Images \nCostume: Marie-Chantale Vaillancourt \n@ 2007 Cirque du Soleil\nThe Jack Pine, 1916–1917\nTom Thomson painting © National Gallery of \nCanada, Ottawa\nPage 26\nDonovan Bailey\nCOC/The Canadian Press/Claus Andersen\nChantal Petitclerc\nCanadian Paralympic Committee \nBenoit Pelosse\nTerry Fox\nEd Linkewich\nWayne Gretzky\nThe Canadian Press – Mike Ridewood\nMark Tewksbury\nThe Canadian Press – Ted Grant\nPaul Henderson\nAdaptation by Henry Garman for the Power to \nChange Campaign, 2008\nCatriona Le May Doan\nThe Canadian Press\nCanadian football\nThe Saskatchewan Roughriders\nPage 27\nSir Frederick Banting\nLibrary and Archives Canada PA-123481\nPage 28\nQueen Elizabeth II opening the 23rd Parliament \n(1957)\nPhotograph by Malak, Ottawa\nParliament Hill\nStock image\nPage 29\nHis Excellency the Right Honourable David \nJohnston\nSun Media\nPage 30\nHouse of Commons chamber\nParliament of Canada\nPage 31\nHouse of Commons in session\nHouse of Commons\nPage 32\nVoter information card\nElections Canada\nPage 33\nProvincial Assembly at Charlottetown, P.E.I.\nGovernment of Prince Edward Island\nPage 35\nQuébec City Hall\nStacey M. Warnke\nPage 36\nScales of Justice, Vancouver Law Courts\nCitizenship and Immigration Canada\nBorder guard with sniffer dog\nCanada Border Services Agency\nPage 37\nJury benches\nDan Carr\nOttawa police constable Steve Lewis helping a \nyoung boy at the Aboriginal Day Flotilla\nOttawa Police Service\nHandcuffs\nCorrectional Services Canada\nYour Canadian Citizenship Study Guide\nPage 38\nMace of the House of Commons, Ottawa\nHouse of Commons Collection \nOttawa Goldsmiths & Silversmiths Company \n(Great Britain)\nCanadian flag of 1965\nStock image\nThe Royal Arms of Canada\nBank of Canada\nParliament at dusk\nStock image\nThe Snowbirds\nNational Defence\nThe Red Ensign\nPatrick Riley, Dominion Command, The Royal \nCanadian Legion\nPage 39\nMontreal Canadiens, Stanley Cup champions, \n1978\nCHC – Denis Brodeur\nRCMP Musical Ride, Ottawa, Ontario\nPatrick Guillot\nThe beaver\nStock image\nPage 40\nOscar Peterson, Norah Willis Michener and \nGovernor General Roland Michener, 1973  \nLibrary and Archives Canada/John Evans \ne002107535-v6 \nPage 41\nColonel Alexander Roberts Dunn, V.C.\nSharif Tarabay\nAble Seaman William Hall, V.C.\n© 2010 Canada Post\nBrigadier Paul Triquet, V.C.\nAdam Sherriff Scott\nCWM 19710261-5841\nBeaverbrook Collection of War Art\n© Canadian War Museum\nSergeant Filip Konowal, V.C.\nArthur Ambrose McEvoy\nCWM 19710261-6070\nBeaverbrook Collection of War Art\n© Canadian War Museum \nHonorary Air Marshal William Avery Bishop, V.C.,\nDSO and Bar, MC, DFC\nAlphonse Jongers\nCWM 19680068-001 Beaverbrook \nCollection of War Art © Canadian War Museum \nLieutenant Robert Hampton Gray, V.C.\nSharif Tarabay\nPage 42\nLumber truck\nStock image\nOil pump jacks in southern Alberta\nStock image\nAtlantic lobster\nStock image\nHydro-electric dam on the Saguenay River, Quebec\nStock image\nToronto’s financial district\nCitizenship and Immigration Canada\nPage 43\nThe Peace Arch at Blaine, Washington\nLeo Chen\nCar assembly plant in Oakville, Ontario\nFord of Canada\nPort of Vancouver\nEvan Leeson\nResearch laboratory\nThe Canadian Press – Darryl Dyck\nRIM’s BlackBerry\nStock image\nIce wine grapes, Niagara Region, Ontario\nStock image\nPage 44\nOttawa’s Rideau Canal\nStock image\nBanff National Park\nStock image\nPeggy’s Cove harbour\nStock image\n62\n63\nPage 46\n“The Edge,” Newfoundland and Labrador\nCanadian Tourism Commission\nMoose\nOntario Tourism\nPoint Prim, Prince Edward Island\nCanadian Tourism Commission\nAnne of Green Gables, Prince Edward Island\nSmudge 9000\nDestroyer HMCS Athabasca (DD282), in the \nforeground, and HMCS Toronto (FF333) sail \nthrough Halifax Harbour on February 17, 2009, for \nan annual sailpast\nCanadian Forces Combat Camera \nPrivate Martin Roy\nCabot Trail, Nova Scotia\nStock image\nPage 47\nHopewell Rocks, Bay of Fundy, New Brunswick\nCanadian Tourism Commission\nWhale\nCanadian Tourism Commission\nRocher Percé\nStock image\nPetit Champlain, Québec City\nStock image\nPage 48\nMuskoka Skeleton Lake, Ontario\nOntario Tourism\nToronto skyline\nStock image\nPisew Falls, Manitoba\nStock image\nGolden Boy statue\nGovernment of Manitoba\nWheat fields in Saskatchewan\nStock image\nCoronach, Saskatchewan\nCanadian Tourism Commission\nPage 49\nAlberta rancher\nStock image\nAlberta oil pump jack\nStock image\nVancouver skyline\nStock image\nOrca\nStock image\nPage 50\nFamily searching for gold, Dawson City, Yukon\nCanadian Tourism Commission\nTakhini Hot Springs Road, Yukon\nCanadian Tourism Commission\nSir William Logan\nNatural Resources Canada\nMount Logan\nNatural Resources Canada\nNorthern lights, Northwest Territories\nCanadian Tourism Commission\nPolar bear\nStock image\nPage 51\nPangnirtung, Nunavut\nLindsay Terry\nInukshuk, Nunavut\nStock image\nThe Canadian Rangers\nNational Defence\nAn Inuit boy in Sanikiluaq, Nunavut \nClarkework Orange Photography\nThe caribou (reindeer)\nDavid Cartier\nPage 56\nConfederation Bridge\nStephen Downes\nPage 66\nSir Wilfrid Laurier\nLibrary and Archives Canada  C-001971\nJohn Diefenbaker \nLibrary and Archives Canada  C-006779\nInside Back\nCover\n2010 men’s hockey Olympic gold medal winners\nGetty Images\nDiscover Canada\nYour Canadian Citizenship Study Guide\nSection 5 of the Citizenship Act\n5. \t(1) The Minister shall grant citizenship to any person who:\n\t\n\t\n(e) has an adequate knowledge of Canada and the responsibilities and privileges of citizenship.\nSection 15 of the Citizenship Regulations \nKNOWLEDGE OF CANADA AND CITIZENSHIP CRITERIA\n15. (1) A person is considered to have an adequate knowledge of Canada if they demonstrate, based on \ntheir responses to questions prepared by the Minister, that they know the national symbols of Canada \nand have a general understanding of the following subjects:\n\t\n\t\n\t\n(a) the chief characteristics of Canadian political and military history;\n\t\n\t\n\t\n(b) the chief characteristics of Canadian social and cultural history;\n\t\n\t\n\t\n(c) the chief characteristics of Canadian physical and political geography;\n\t\n\t\n\t\n(d) \u0007\nthe chief characteristics of the Canadian system of government as a constitutional  \nmonarchy; and\n\t\n\t\n\t\n(e) characteristics of Canada other than those referred to in paragraphs (a) to (d).\n\t\n\u0007\n(2)\u0007\n A person is considered to have an adequate knowledge of the responsibilities and privileges of \ncitizenship if they demonstrate, based on their responses to questions prepared by the Minister, \nthat they have a general understanding of the following subjects:\n\t\n\t\n\t\n(a) participation in the Canadian democratic process;\n\t\n\t\n\t\n(b) \u0007\nparticipation in Canadian society, including volunteerism, respect for the environment  \nand the protection of Canada’s natural, cultural and architectural heritage;\n\t\n\t\n\t\n(c) respect for the rights, freedoms and obligations set out in the laws of Canada; and\n\t\n\t\n\t\n(d) \u0007\nthe responsibilities and privileges of citizenship other than those referred to in paragraphs  \n(a) to (c).\nAuthorities\n64\n65\nDiscover Canada\nNotes\nYour Canadian Citizenship Study Guide\nMemorable Quotes\n66\n“\u0007\nFor here [in Canada], \nI want the marble to remain the marble; \nthe granite to remain the granite; \nthe oak to remain the oak; \nand out of these elements, \nI would build a nation great among the nations of the world.”\n  — \u0007\nSir Wilfrid Laurier \n7th Prime Minister of Canada \nJuly 11, 1896 – October 6, 1911\n“\u0007\nI am a Canadian, \na free Canadian, \nfree to speak without fear, \nfree to worship in my own way, \nfree to stand for what I think right, \nfree to oppose what I believe wrong, \nor free to choose those \nwho shall govern my country. \nThis heritage of freedom \nI pledge to uphold \nfor myself and all mankind.”\n— \u0007\nJohn Diefenbaker \n13th Prime Minister of Canada \nJune 21, 1957 – April 22, 1963\nThese quotes do not need to be learned for the citizenship test.  \nDiscover Canada\nTeam Canada won gold \nin men’s hockey at the \n2010 Winter Olympics in \nVancouver\nDiscover Canada\nPublications Feedback Survey\nWe invite you to provide us with your comments on this publication  \nby completing our electronic feedback survey at cic.gc.ca/publications-survey.\nVisit us online \nFacebook: www.facebook.com/CitCanada \nYouTube: www.youtube.com/CitImmCanada \nTwitter: @CitImmCanada \nWebsite: www.cic.gc.ca\nAvailable in alternative formats upon request.\n",
      ],
      doc_ids: [
        "e5b80b5d-ad99-4069-a000-b1ac18f82e7c",
        "53d88d17-06cd-44e7-adcb-3d163280188c",
      ],
      general_notes:
        "Generated based on query: hello. This scan covers documents from various sources and provides a summarized overview.",
      keywords: [],
      resources_searched: [],
      _rid: "yLthALKhnusqAAAAAAAAAA==",
      _self: "dbs/yLthAA==/colls/yLthALKhnus=/docs/yLthALKhnusqAAAAAAAAAA==/",
      _etag: '"0600a9a3-0000-0a00-0000-66f56fa00000"',
      _attachments: "attachments/",
      _ts: 1727360928,
    };

    return of(mockData);
  }
}
