/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureWizardPromptStep, IAzureQuickPickItem } from 'vscode-azureextensionui';
import { githubApiEndpoint, gitHubOrgDataSetting } from '../constants';
import { ext } from '../extensionVariables';
import { IGitHubAccessTokenContext } from '../IGitHubAccessTokenContext';
import { localize } from '../utils/localize';
import { getWorkspaceSetting } from '../utils/vsCodeConfig/settings';
import { createGitHubRequestOptions, createQuickPickFromJsons, getGitHubJsonResponse, gitHubOrgData, gitHubWebResource } from './connectToGitHub';

export class GitHubOrgListStep extends AzureWizardPromptStep<IGitHubAccessTokenContext> {
    public async prompt(context: IGitHubAccessTokenContext): Promise<void> {
        const placeHolder: string = localize('chooseOrg', 'Choose organization.');
        let orgData: gitHubOrgData | undefined;

        do {
            orgData = (await ext.ui.showQuickPick(this.getOrganizations(context), { placeHolder })).data;
        } while (!orgData);

        context.orgData = orgData;
    }

    public shouldPrompt(context: IGitHubAccessTokenContext): boolean {
        context.orgData = getWorkspaceSetting(gitHubOrgDataSetting);
        return !context.orgData?.login;
    }

    private async getOrganizations(context: IGitHubAccessTokenContext): Promise<IAzureQuickPickItem<gitHubOrgData | undefined>[]> {
        let requestOptions: gitHubWebResource = await createGitHubRequestOptions(context, `${githubApiEndpoint}/user`);
        let quickPickItems: IAzureQuickPickItem<gitHubOrgData>[] = createQuickPickFromJsons<gitHubOrgData>(await getGitHubJsonResponse<gitHubOrgData[]>(requestOptions), 'login');

        requestOptions = await createGitHubRequestOptions(context, `${githubApiEndpoint}/user/orgs`);
        quickPickItems = quickPickItems.concat(createQuickPickFromJsons<gitHubOrgData>(await getGitHubJsonResponse<gitHubOrgData[]>(requestOptions), 'login'));

        return quickPickItems;
    }
}
