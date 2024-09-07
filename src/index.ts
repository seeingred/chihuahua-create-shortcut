import { getGamePath } from 'steam-game-path'
import fs from 'fs'
// @ts-ignore
import createDesktopShortcut from 'create-desktop-shortcuts'
// @ts-ignore
import getWindowsShortcutProperties from 'get-windows-shortcut-properties'
import * as path from 'path'

type FileData = {
    uri: string
    icon: string
}

enum StoreType {
    STEAM = 'STEAM',
    EGS = 'EGS',
    GOG = 'GOG',
    STANDALONE = 'STANDALONE'
}

// function to find exe file in a directory
function findExeFile(dir: string): string | null {
    const files = fs.readdirSync(dir)
    for (const file of files) {
        if (path.extname(file) === '.exe') {
            return path.join(dir, file)
        }
    }
    return null
}

function findLaunchLnk(dir: string): string | null {
    const files = fs.readdirSync(dir)
    for (const file of files) {
        if (path.extname(file) === '.lnk' && file.includes('Launch')) {
            return path.join(dir, file)
        }
    }
    return null
}

type LnkProperties = {
    FullName: string
    Arguments: string
    Description: string
    Hotkey: string
    IconLocation: string
    RelativePath: string
    TargetPath: string
    WindowStyle: string
    WorkingDirectory: string
}

const main = async (chihuahuaPath: string, sourceFile: string) => {
    const sourceFileExtension = sourceFile.substring(sourceFile.lastIndexOf('.'))
    const sourceFileName = sourceFile.substring(sourceFile.lastIndexOf('\\') + 1)
    const sourceFileNameWithoutExtension = sourceFileName.substring(0, sourceFileName.lastIndexOf('.'))

    let fileData: FileData = {
        uri: '',
        icon: ''
    }

    const currentDir = process.cwd()
    const chihuahuaDir = chihuahuaPath.substring(0, chihuahuaPath.lastIndexOf('\\')) + '\\'

    const options = {
        filePath: chihuahuaPath,
        name: sourceFileNameWithoutExtension,
        comment: 'Launch in UEVR',
        workingDir: chihuahuaDir,
        icon: '',
        outputPath: currentDir,
        arguments: ''
    }

    let shortcutData: LnkProperties | null = null

    if (sourceFileExtension === '.lnk') {
        const result = getWindowsShortcutProperties.sync(sourceFile)
        console.log(`shortcutData:  `, result)
        shortcutData = result[0] as LnkProperties
    } else if (sourceFileExtension === '.url') {
        const fileContent = fs.readFileSync(sourceFile, 'utf8')
        const fileLines = fileContent.split('\n')
        const urlLine = fileLines.find(line => line.startsWith('URL='))
        if (!urlLine) {
            throw new Error('URL line not found')
        }
        const uri = urlLine.substring(4).trim()
        let icon = ''
        const iconLine = fileLines.find(line => line.startsWith('IconFile='))
        if (iconLine) {
            icon = iconLine.substring('IconFile='.length).trim()
        }
        fileData = {
            uri,
            icon
        }
    }

    let store: StoreType = StoreType.STANDALONE
    if (sourceFileExtension === '.url' && fileData.uri.startsWith('steam://')) {
        store = StoreType.STEAM
    } else if (sourceFileExtension === '.url' && fileData.uri.startsWith('com.epicgames.launcher://')) {
        store = StoreType.EGS
    } else if (sourceFileExtension === '.lnk') {
        if (shortcutData?.TargetPath.includes('GalaxyClient.exe')) {
            store = StoreType.GOG
        }
    }

    if (store === StoreType.STEAM) {
        const gameID = parseInt(fileData.uri.substring('steam://rungameid/'.length))
        const gamePathObj = getGamePath(gameID)
        const gamePathUri = gamePathObj?.game?.path || ''
        // find game exe in dir
        const exeFilePath = findExeFile(gamePathUri)
        const gameName = gamePathObj?.game?.name || sourceFileNameWithoutExtension
        options.arguments = `"${exeFilePath}" --launch-cmd "${fileData.uri}"`
        options.name = gameName
        options.icon = fileData.icon
    } else if (store === StoreType.EGS) {
        // gamePath in EGS is usually the same as icon path
        const exeFilePath = fileData.icon
        options.arguments = `"${exeFilePath}" --launch-cmd "${fileData.uri}"`
        options.icon = fileData.icon
    } else if (store === StoreType.GOG && shortcutData) {
        const shortcutDataEnsured = shortcutData as LnkProperties
        const args = shortcutDataEnsured.Arguments
        const gamePathUri = args.substring(args.indexOf('/path=') + '/path="'.length, args.lastIndexOf('"'))
        const properLnk = findLaunchLnk(gamePathUri)
        shortcutData = getWindowsShortcutProperties.sync(properLnk)[0] as LnkProperties
        console.log(`shortcutData real:  `, shortcutData);
        options.arguments = `"${shortcutData.TargetPath}"${shortcutData.Arguments? ` --launch-args "${shortcutData.Arguments}"` : ''}`
        options.icon = shortcutData.IconLocation || ''

    } else if (shortcutData) {
        const shortcutDataEnsured = shortcutData as LnkProperties
        options.arguments = `"${shortcutData.TargetPath}"${shortcutDataEnsured.Arguments? ` --launch-args "${shortcutDataEnsured.Arguments}"` : ''}`
        options.icon = shortcutDataEnsured.IconLocation || ''
    }

    options.name = options.name + ' [ue]'

    console.log(`LNK FILE OPTIONS:  `, options)

    await createDesktopShortcut({
        windows: options
    })
}

const chihuahuaPath = process.argv[2]
const sourceLnkFile = process.argv[3]
main(chihuahuaPath, sourceLnkFile)
